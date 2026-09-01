import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { logActivity } from '../services/activityService';
import { AuthRequest } from '../middleware/auth';

export const getMaintenanceTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority, assetId, technicianId } = req.query;
    const where: any = {};

    if (status && status !== 'ALL') where.status = String(status);
    if (priority && priority !== 'ALL') where.priority = String(priority);
    if (assetId) where.assetId = String(assetId);
    if (technicianId) where.technicianId = String(technicianId);

    const tasks = await prisma.maintenanceTask.findMany({
      where,
      include: {
        asset: true,
        technician: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ tasks });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch maintenance tasks' });
  }
};

export const createMaintenanceTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assetId, title, description, priority, status, technicianId, scheduledDate, cost, notes } = req.body;

    if (!assetId || !title || !description) {
      res.status(400).json({ error: 'Asset, title, and description are required.' });
      return;
    }

    const task = await prisma.maintenanceTask.create({
      data: {
        assetId: String(assetId),
        title: String(title),
        description: String(description),
        priority: priority ? String(priority) : 'MEDIUM',
        status: status ? String(status) : 'REPORTED',
        technicianId: technicianId ? String(technicianId) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 86400000 * 2),
        cost: cost ? parseFloat(String(cost)) : 0,
        notes: notes ? String(notes) : undefined
      },
      include: { asset: true, technician: true }
    });

    // If critical or scheduled, update asset status
    if (priority === 'CRITICAL' || status === 'IN_PROGRESS') {
      await prisma.asset.update({
        where: { id: String(assetId) },
        data: { status: 'UNDER_MAINTENANCE', lifecycleStage: 'UNDER_MAINTENANCE' }
      });
    }

    await logActivity({
      userId: req.user?.userId,
      assetId: String(assetId),
      activityType: 'MAINTENANCE_SCHEDULED',
      description: `Maintenance task created: "${task.title}" for ${task.asset.name} [Priority: ${task.priority}]`,
      metadata: { taskId: task.id, priority: task.priority, cost: task.cost }
    });

    res.status(201).json({ task });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create maintenance task' });
  }
};

export const updateMaintenanceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, completedDate, actualCost, notes } = req.body;

    const prevTask = await prisma.maintenanceTask.findUnique({
      where: { id },
      include: { asset: true }
    });

    if (!prevTask) {
      res.status(404).json({ error: 'Maintenance task not found' });
      return;
    }

    const updateData: any = { status: String(status) };
    if (notes) updateData.notes = String(notes);
    if (actualCost) updateData.cost = parseFloat(String(actualCost));

    if (status === 'COMPLETED') {
      updateData.completedDate = completedDate ? new Date(completedDate) : new Date();
      // Restore asset to operational / available
      await prisma.asset.update({
        where: { id: prevTask.assetId },
        data: {
          status: 'AVAILABLE',
          lifecycleStage: 'AVAILABLE',
          healthScore: Math.min(100, (prevTask.asset.healthScore || 90) + 15)
        }
      });
    } else if (status === 'IN_PROGRESS') {
      await prisma.asset.update({
        where: { id: prevTask.assetId },
        data: { status: 'UNDER_MAINTENANCE', lifecycleStage: 'UNDER_MAINTENANCE' }
      });
    }

    const task = await prisma.maintenanceTask.update({
      where: { id },
      data: updateData,
      include: { asset: true, technician: true }
    });

    await logActivity({
      userId: req.user?.userId,
      assetId: prevTask.assetId,
      activityType: status === 'COMPLETED' ? 'MAINTENANCE_COMPLETED' : 'MAINTENANCE_UPDATED',
      description: `Maintenance "${task.title}" updated to status: ${status}`,
      metadata: { fromStatus: prevTask.status, toStatus: status }
    });

    res.json({ task });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update maintenance task' });
  }
};

export const assignTechnician = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { technicianId } = req.body;

    const task = await prisma.maintenanceTask.update({
      where: { id },
      data: { technicianId: technicianId ? String(technicianId) : null },
      include: { asset: true, technician: true }
    });

    res.json({ task });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to assign technician' });
  }
};
