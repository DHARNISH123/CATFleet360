import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { calculateFleetHealth } from '../services/healthScoreService';

export const getOperationsOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const healthMetrics = await calculateFleetHealth();

    const recentActivities = await prisma.activityLog.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, role: true, avatar: true } },
        asset: { select: { id: true, assetId: true, name: true, category: true, location: true } }
      }
    });

    const categoryBreakdown = await prisma.asset.groupBy({
      by: ['category'],
      _count: { id: true }
    });

    const statusBreakdown = await prisma.asset.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    const upcomingMaintenance = await prisma.maintenanceTask.findMany({
      where: { status: { not: 'COMPLETED' } },
      take: 5,
      orderBy: { scheduledDate: 'asc' },
      include: { asset: true, technician: true }
    });

    const activeRentals = await prisma.rental.findMany({
      where: { status: 'ACTIVE' },
      take: 5,
      include: { asset: true },
      orderBy: { endDate: 'asc' }
    });

    res.json({
      metrics: healthMetrics,
      recentActivities,
      categoryBreakdown,
      statusBreakdown,
      upcomingMaintenance,
      activeRentals
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load operations overview' });
  }
};

export const getLiveOperations = async (req: Request, res: Response): Promise<void> => {
  try {
    const assets = await prisma.asset.findMany({
      include: {
        assignments: {
          where: { active: true },
          include: { operator: true }
        },
        maintenanceTasks: {
          where: { status: 'IN_PROGRESS' }
        },
        rentals: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    const liveFeedEvents = [
      {
        id: 'evt-1',
        type: 'GEOFENCE',
        assetId: 'CAT-EX-205',
        assetName: 'CAT 320 GC Excavator',
        message: 'Entered Sector 4 - Excavation Zone B',
        location: 'Jobsite Alpha',
        time: 'Just now',
        status: 'OPERATIONAL'
      },
      {
        id: 'evt-2',
        type: 'TELEMETRY',
        assetId: 'CAT-TR-770',
        assetName: 'CAT 770G Off-Highway Truck',
        message: 'Engine idle time exceeded 45 mins. Eco-mode engaged.',
        location: 'West Quarry',
        time: '4m ago',
        status: 'IDLE'
      },
      {
        id: 'evt-3',
        type: 'MAINTENANCE',
        assetId: 'CAT-DZ-801',
        assetName: 'CAT D8T Track Dozer',
        message: 'Hydraulic pressure telemetry variance detected (98.4 PSI). Scheduled inspection required.',
        location: 'South Highway Expansion',
        time: '12m ago',
        status: 'UNDER_MAINTENANCE'
      },
      {
        id: 'evt-4',
        type: 'RENTAL',
        assetId: 'CAT-WL-950',
        assetName: 'CAT 950 GC Wheel Loader',
        message: 'On-site rental handover completed with Turner Construction.',
        location: 'Jobsite Alpha',
        time: '26m ago',
        status: 'ON_RENT'
      },
      {
        id: 'evt-5',
        type: 'OPERATOR',
        assetId: 'CAT-MG-140',
        assetName: 'CAT 140 GC Motor Grader',
        message: 'Shift handover verified: Marcus Vance logged on active duty.',
        location: 'Central Yard',
        time: '41m ago',
        status: 'OPERATIONAL'
      }
    ];

    res.json({
      mapAssets: assets,
      liveFeed: liveFeedEvents
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load live operations' });
  }
};

export const globalSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      res.json({ results: [] });
      return;
    }

    const query = q.toLowerCase();

    const [assets, operators, maintenance, rentals] = await Promise.all([
      prisma.asset.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { assetId: { contains: query } },
            { model: { contains: query } },
            { location: { contains: query } }
          ]
        },
        take: 5
      }),
      prisma.operator.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { employeeId: { contains: query } },
            { email: { contains: query } }
          ]
        },
        take: 5
      }),
      prisma.maintenanceTask.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } }
          ]
        },
        include: { asset: true },
        take: 5
      }),
      prisma.rental.findMany({
        where: {
          OR: [
            { customerName: { contains: query } },
            { customerEmail: { contains: query } }
          ]
        },
        include: { asset: true },
        take: 5
      })
    ]);

    const results = [
      ...assets.map(a => ({ type: 'ASSET', id: a.id, title: `${a.name} (${a.assetId})`, subtitle: `${a.category} • ${a.location}`, status: a.status, raw: a })),
      ...operators.map(o => ({ type: 'OPERATOR', id: o.id, title: `${o.name} (${o.employeeId})`, subtitle: `${o.status} • ${o.shift}`, status: o.status, raw: o })),
      ...maintenance.map(m => ({ type: 'MAINTENANCE', id: m.id, title: m.title, subtitle: `Asset: ${m.asset.name} • Priority: ${m.priority}`, status: m.status, raw: m })),
      ...rentals.map(r => ({ type: 'RENTAL', id: r.id, title: `Rental: ${r.customerName}`, subtitle: `Asset: ${r.asset.name} • ${r.status}`, status: r.status, raw: r }))
    ];

    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Search failed' });
  }
};
