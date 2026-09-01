import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { logActivity } from '../services/activityService';
import { AuthRequest } from '../middleware/auth';

export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, lifecycleStage, search, minUtil, location } = req.query;
    
    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = String(category);
    }
    if (status && status !== 'ALL') {
      where.status = String(status);
    }
    if (lifecycleStage && lifecycleStage !== 'ALL') {
      where.lifecycleStage = String(lifecycleStage);
    }
    if (location && location !== 'ALL') {
      where.location = String(location);
    }
    if (minUtil) {
      where.utilization = { gte: parseFloat(String(minUtil)) };
    }
    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { name: { contains: q } },
        { assetId: { contains: q } },
        { model: { contains: q } },
        { location: { contains: q } },
        { category: { contains: q } }
      ];
    }

    const assets = await prisma.asset.findMany({
      where,
      include: {
        assignments: {
          where: { active: true },
          include: { operator: true }
        },
        maintenanceTasks: {
          where: { status: { not: 'COMPLETED' } }
        },
        rentals: {
          where: { status: 'ACTIVE' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ assets });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch assets' });
  }
};

export const getAssetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const asset = await prisma.asset.findFirst({
      where: {
        OR: [{ id: id }, { assetId: id }]
      },
      include: {
        assignments: {
          include: { operator: true },
          orderBy: { assignedAt: 'desc' }
        },
        maintenanceTasks: {
          include: { technician: true },
          orderBy: { createdAt: 'desc' }
        },
        rentals: {
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    res.json({ asset });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve asset details' });
  }
};

export const createAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      assetId,
      name,
      category,
      manufacturer,
      model,
      year,
      status,
      lifecycleStage,
      location,
      latitude,
      longitude,
      utilization,
      fuelLevel,
      healthScore,
      operatingHours,
      serialNumber,
      imageUrl,
      notes
    } = req.body;

    const existing = await prisma.asset.findUnique({ where: { assetId: String(assetId) } });
    if (existing) {
      res.status(409).json({ error: `Asset with ID ${assetId} already exists.` });
      return;
    }

    const asset = await prisma.asset.create({
      data: {
        assetId: String(assetId),
        name: String(name),
        category: category ? String(category) : 'Hydraulic Excavator',
        manufacturer: manufacturer ? String(manufacturer) : 'Caterpillar',
        model: model ? String(model) : '320 GC',
        year: year ? parseInt(String(year)) : 2024,
        status: status ? String(status) : 'AVAILABLE',
        lifecycleStage: lifecycleStage ? String(lifecycleStage) : 'AVAILABLE',
        location: location ? String(location) : 'Jobsite Alpha',
        latitude: latitude ? parseFloat(String(latitude)) : 37.7749,
        longitude: longitude ? parseFloat(String(longitude)) : -122.4194,
        utilization: utilization ? parseFloat(String(utilization)) : 0,
        fuelLevel: fuelLevel ? parseFloat(String(fuelLevel)) : 90,
        healthScore: healthScore ? parseFloat(String(healthScore)) : 98,
        operatingHours: operatingHours ? parseFloat(String(operatingHours)) : 100,
        serialNumber: serialNumber ? String(serialNumber) : `CAT-SN-${Math.floor(100000 + Math.random() * 900000)}`,
        imageUrl: imageUrl ? String(imageUrl) : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        notes: notes ? String(notes) : undefined
      }
    });

    await logActivity({
      userId: req.user?.userId,
      assetId: asset.id,
      activityType: 'ASSET_CREATED',
      description: `New asset registered into fleet: ${asset.name} (${asset.assetId})`,
      metadata: { category: asset.category, model: asset.model, location: asset.location }
    });

    res.status(201).json({ asset });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create asset' });
  }
};

export const updateAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const updateData = req.body;

    const prevAsset = await prisma.asset.findUnique({ where: { id } });
    if (!prevAsset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: updateData
    });

    if (updateData.status && updateData.status !== prevAsset.status) {
      await logActivity({
        userId: req.user?.userId,
        assetId: asset.id,
        activityType: 'STATUS_CHANGED',
        description: `Status changed from ${prevAsset.status} to ${updateData.status}`,
        metadata: { from: prevAsset.status, to: updateData.status }
      });
    }

    res.json({ asset });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update asset' });
  }
};

export const updateAssetLifecycle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { lifecycleStage, reason, status } = req.body;

    const prevAsset = await prisma.asset.findUnique({ where: { id } });
    if (!prevAsset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    // Determine corresponding operational status based on stage
    let newStatus = status || prevAsset.status;
    if (!status) {
      if (lifecycleStage === 'REGISTERED' || lifecycleStage === 'AVAILABLE') newStatus = 'AVAILABLE';
      if (lifecycleStage === 'ASSIGNED') newStatus = 'OPERATIONAL';
      if (lifecycleStage === 'IN_OPERATION') newStatus = 'OPERATIONAL';
      if (lifecycleStage === 'UNDER_MAINTENANCE') newStatus = 'UNDER_MAINTENANCE';
      if (lifecycleStage === 'RENTAL') newStatus = 'ON_RENT';
      if (lifecycleStage === 'RETIRED') newStatus = 'RETIRED';
    }

    const asset = await prisma.asset.update({
      where: { id },
      data: {
        lifecycleStage: String(lifecycleStage),
        status: newStatus
      }
    });

    await logActivity({
      userId: req.user?.userId,
      assetId: asset.id,
      activityType: 'LIFECYCLE_CHANGED',
      description: `Lifecycle transition: ${prevAsset.lifecycleStage} ➔ ${lifecycleStage}. Note: ${reason || 'Operational update'}`,
      metadata: { fromStage: prevAsset.lifecycleStage, toStage: lifecycleStage, reason }
    });

    res.json({ asset });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to transition lifecycle stage' });
  }
};

export const deleteAsset = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    await prisma.asset.delete({ where: { id } });

    await logActivity({
      userId: req.user?.userId,
      activityType: 'ASSET_DELETED',
      description: `Asset ${asset.name} (${asset.assetId}) removed from fleet database`,
      metadata: { assetId: asset.assetId, name: asset.name }
    });

    res.json({ message: 'Asset deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete asset' });
  }
};
