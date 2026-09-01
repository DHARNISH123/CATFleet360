import prisma from '../utils/prisma';

export interface LogActivityParams {
  userId?: string;
  assetId?: string;
  activityType: string;
  description: string;
  metadata?: Record<string, any>;
}

export const logActivity = async (params: LogActivityParams) => {
  try {
    return await prisma.activityLog.create({
      data: {
        userId: params.userId,
        assetId: params.assetId,
        activityType: params.activityType,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null
      }
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
};
