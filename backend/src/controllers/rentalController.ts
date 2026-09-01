import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { logActivity } from '../services/activityService';
import { AuthRequest } from '../middleware/auth';

export const getRentals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, assetId } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') where.status = String(status);
    if (assetId) where.assetId = String(assetId);

    const rentals = await prisma.rental.findMany({
      where,
      include: {
        asset: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ rentals });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch rentals' });
  }
};

export const createRental = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      assetId,
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      endDate,
      dailyRate,
      notes
    } = req.body;

    if (!assetId || !customerName || !customerEmail || !startDate || !endDate) {
      res.status(400).json({ error: 'Asset, customer details, and dates are required.' });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const rate = dailyRate ? parseFloat(String(dailyRate)) : 450;
    const estimatedCost = days * rate;

    const rental = await prisma.rental.create({
      data: {
        assetId: String(assetId),
        customerName: String(customerName),
        customerEmail: String(customerEmail),
        customerPhone: customerPhone ? String(customerPhone) : undefined,
        startDate: start,
        endDate: end,
        status: 'REQUESTED',
        dailyRate: rate,
        estimatedCost,
        paymentStatus: 'PENDING',
        notes: notes ? String(notes) : undefined
      },
      include: { asset: true }
    });

    await logActivity({
      userId: req.user?.userId,
      assetId: String(assetId),
      activityType: 'RENTAL_REQUESTED',
      description: `Rental requested for ${rental.asset.name} by ${customerName} (${days} days @ $${rate}/day = $${estimatedCost})`,
      metadata: { rentalId: rental.id, days, estimatedCost }
    });

    res.status(201).json({ rental });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create rental' });
  }
};

export const updateRentalStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, paymentStatus, actualCost, notes } = req.body;

    const prevRental = await prisma.rental.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!prevRental) {
      res.status(404).json({ error: 'Rental not found' });
      return;
    }

    const updateData: any = {};
    if (status) updateData.status = String(status);
    if (paymentStatus) updateData.paymentStatus = String(paymentStatus);
    if (actualCost) updateData.actualCost = parseFloat(String(actualCost));
    if (notes) updateData.notes = String(notes);

    // Side effects on asset state
    if (status === 'ACTIVE') {
      await prisma.asset.update({
        where: { id: prevRental.assetId },
        data: { status: 'ON_RENT', lifecycleStage: 'RENTAL' }
      });
      await logActivity({
        userId: req.user?.userId,
        assetId: prevRental.assetId,
        activityType: 'RENTAL_STARTED',
        description: `Equipment dispatched for active rental to ${prevRental.customerName}`,
        metadata: { rentalId: prevRental.id }
      });
    } else if (status === 'COMPLETED' || status === 'CANCELLED') {
      await prisma.asset.update({
        where: { id: prevRental.assetId },
        data: { status: 'AVAILABLE', lifecycleStage: 'AVAILABLE' }
      });
      await logActivity({
        userId: req.user?.userId,
        assetId: prevRental.assetId,
        activityType: 'RENTAL_RETURNED',
        description: `Equipment returned from rental by ${prevRental.customerName}. Returned to available pool.`,
        metadata: { rentalId: prevRental.id, finalStatus: status }
      });
    }

    const rental = await prisma.rental.update({
      where: { id },
      data: updateData,
      include: { asset: true }
    });

    res.json({ rental });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update rental status' });
  }
};
