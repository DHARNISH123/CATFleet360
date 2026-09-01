import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { logActivity } from '../services/activityService';
import { AuthRequest } from '../middleware/auth';

export const getOperators = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') where.status = String(status);
    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { employeeId: { contains: q } },
        { email: { contains: q } },
        { certifications: { contains: q } }
      ];
    }

    const operators = await prisma.operator.findMany({
      where,
      include: {
        assignments: {
          where: { active: true },
          include: { asset: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ operators });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch operators' });
  }
};

export const createOperator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { employeeId, name, email, phone, status, certifications, shift, safetyScore } = req.body;

    if (!employeeId || !name || !email) {
      res.status(400).json({ error: 'Employee ID, name, and email are required.' });
      return;
    }

    const operator = await prisma.operator.create({
      data: {
        employeeId: String(employeeId),
        name: String(name),
        email: String(email),
        phone: phone ? String(phone) : '+1 (555) 019-2831',
        status: status ? String(status) : 'AVAILABLE',
        certifications: certifications ? String(certifications) : 'Standard Equipment Certified',
        shift: shift ? String(shift) : 'Morning (06:00 - 14:00)',
        safetyScore: safetyScore ? parseFloat(String(safetyScore)) : 98,
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`
      }
    });

    await logActivity({
      userId: req.user?.userId,
      activityType: 'OPERATOR_REGISTERED',
      description: `Operator ${operator.name} (${operator.employeeId}) registered in system`,
      metadata: { operatorId: operator.id, certifications: operator.certifications }
    });

    res.status(201).json({ operator });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create operator' });
  }
};

export const assignAssetToOperator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { operatorId, assetId, notes } = req.body;

    if (!operatorId || !assetId) {
      res.status(400).json({ error: 'Operator and asset are required.' });
      return;
    }

    const opId = String(operatorId);
    const astId = String(assetId);

    // Deactivate existing active assignment on this asset or operator
    await prisma.assetAssignment.updateMany({
      where: {
        OR: [{ assetId: astId, active: true }, { operatorId: opId, active: true }]
      },
      data: {
        active: false,
        unassignedAt: new Date()
      }
    });

    const assignment = await prisma.assetAssignment.create({
      data: {
        operatorId: opId,
        assetId: astId,
        active: true,
        notes: notes ? String(notes) : undefined
      },
      include: { operator: true, asset: true }
    });

    // Update asset & operator statuses
    await prisma.asset.update({
      where: { id: astId },
      data: { status: 'OPERATIONAL', lifecycleStage: 'ASSIGNED' }
    });

    await prisma.operator.update({
      where: { id: opId },
      data: { status: 'ON_DUTY' }
    });

    await logActivity({
      userId: req.user?.userId,
      assetId: astId,
      activityType: 'ASSET_ASSIGNED',
      description: `Asset ${assignment.asset.name} (${assignment.asset.assetId}) assigned to Operator ${assignment.operator.name}`,
      metadata: { operatorId: opId, assetId: astId }
    });

    res.status(201).json({ assignment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to assign operator' });
  }
};

export const unassignAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assignmentId = String(req.params.assignmentId);

    const assignment = await prisma.assetAssignment.findUnique({
      where: { id: assignmentId },
      include: { asset: true, operator: true }
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    await prisma.assetAssignment.update({
      where: { id: assignmentId },
      data: {
        active: false,
        unassignedAt: new Date()
      }
    });

    await prisma.operator.update({
      where: { id: assignment.operatorId },
      data: { status: 'AVAILABLE' }
    });

    await prisma.asset.update({
      where: { id: assignment.assetId },
      data: { status: 'AVAILABLE', lifecycleStage: 'AVAILABLE' }
    });

    await logActivity({
      userId: req.user?.userId,
      assetId: assignment.assetId,
      activityType: 'ASSET_UNASSIGNED',
      description: `Asset ${assignment.asset.name} unassigned from ${assignment.operator.name}. Returned to ready status.`,
      metadata: { assignmentId }
    });

    res.json({ message: 'Assignment released successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to unassign asset' });
  }
};
