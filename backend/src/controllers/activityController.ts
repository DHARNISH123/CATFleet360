import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getActivityLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assetId, activityType, limit } = req.query;
    const where: any = {};

    if (assetId) where.assetId = String(assetId);
    if (activityType && activityType !== 'ALL') where.activityType = String(activityType);

    const logs = await prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, role: true, avatar: true } },
        asset: { select: { id: true, assetId: true, name: true, category: true, location: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(String(limit)) : 50
    });

    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch activity logs' });
  }
};
