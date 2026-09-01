import prisma from '../utils/prisma';

export interface FleetHealthMetrics {
  healthScore: number;
  totalAssets: number;
  operationalCount: number;
  availabilityRate: number;
  inMaintenanceCount: number;
  onRentCount: number;
  idleCount: number;
  averageUtilization: number;
  overdueMaintenanceCount: number;
  smartAlerts: Array<{
    id: string;
    type: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    description: string;
    assetId?: string;
    assetName?: string;
    timestamp: string;
  }>;
}

export const calculateFleetHealth = async (): Promise<FleetHealthMetrics> => {
  const assets = await prisma.asset.findMany({
    include: {
      maintenanceTasks: {
        where: {
          status: { not: 'COMPLETED' }
        }
      },
      rentals: {
        where: {
          status: 'ACTIVE'
        }
      }
    }
  });

  const totalAssets = assets.length || 1;
  const operationalCount = assets.filter(a => a.status === 'OPERATIONAL' || a.lifecycleStage === 'IN_OPERATION' || a.lifecycleStage === 'AVAILABLE').length;
  const inMaintenanceCount = assets.filter(a => a.status === 'UNDER_MAINTENANCE' || a.lifecycleStage === 'UNDER_MAINTENANCE').length;
  const onRentCount = assets.filter(a => a.status === 'ON_RENT' || a.lifecycleStage === 'RENTAL').length;
  const idleCount = assets.filter(a => a.status === 'IDLE').length;

  const totalUtil = assets.reduce((sum, a) => sum + (a.utilization || 0), 0);
  const averageUtilization = Math.round(totalUtil / totalAssets);
  const availabilityRate = Math.round((operationalCount / totalAssets) * 100);

  // Check overdue tasks
  const now = new Date();
  const allOpenTasks = await prisma.maintenanceTask.findMany({
    where: { status: { not: 'COMPLETED' } },
    include: { asset: true }
  });
  
  const overdueTasks = allOpenTasks.filter(t => t.scheduledDate && new Date(t.scheduledDate) < now);
  const overdueMaintenanceCount = overdueTasks.length;

  // Fleet Health Score Formula (0 - 100):
  // Baseline 100:
  // - Deduct 4 points for each % drop in availability below 90%
  // - Deduct 5 points per overdue maintenance item
  // - Deduct 3 points for assets with critical low health (<70)
  // - Add bonus for high utilization stability
  let score = 100;
  if (availabilityRate < 90) {
    score -= (90 - availabilityRate) * 0.8;
  }
  score -= overdueMaintenanceCount * 4;
  const lowHealthAssets = assets.filter(a => (a.healthScore || 100) < 70).length;
  score -= lowHealthAssets * 5;
  score = Math.max(15, Math.min(99, Math.round(score)));

  // Generate Smart Alerts
  const smartAlerts: FleetHealthMetrics['smartAlerts'] = [];

  overdueTasks.forEach(task => {
    smartAlerts.push({
      id: `alert-overdue-${task.id}`,
      type: 'CRITICAL',
      title: `Overdue Maintenance: ${task.asset.name}`,
      description: `Task "${task.title}" was scheduled for ${task.scheduledDate?.toISOString().split('T')[0]}. Priority: ${task.priority}`,
      assetId: task.asset.assetId,
      assetName: task.asset.name,
      timestamp: new Date().toISOString()
    });
  });

  assets.filter(a => a.utilization < 25 && a.status === 'OPERATIONAL').forEach(asset => {
    smartAlerts.push({
      id: `alert-low-util-${asset.id}`,
      type: 'WARNING',
      title: `Low Utilization Warning`,
      description: `${asset.name} (${asset.assetId}) is running at ${asset.utilization}% utilization over the past 72h. Consider reassigning to active sector.`,
      assetId: asset.assetId,
      assetName: asset.name,
      timestamp: new Date().toISOString()
    });
  });

  assets.filter(a => a.fuelLevel < 20).forEach(asset => {
    smartAlerts.push({
      id: `alert-fuel-${asset.id}`,
      type: 'WARNING',
      title: `Critical Low Fuel Reserve`,
      description: `${asset.name} (${asset.assetId}) at ${asset.location} has ${asset.fuelLevel}% fuel remaining. Mobile tanker dispatch recommended.`,
      assetId: asset.assetId,
      assetName: asset.name,
      timestamp: new Date().toISOString()
    });
  });

  return {
    healthScore: score,
    totalAssets,
    operationalCount,
    availabilityRate,
    inMaintenanceCount,
    onRentCount,
    idleCount,
    averageUtilization,
    overdueMaintenanceCount,
    smartAlerts
  };
};
