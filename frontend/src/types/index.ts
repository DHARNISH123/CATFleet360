export type Role = 'ADMINISTRATOR' | 'FLEET_MANAGER' | 'TECHNICIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export type LifecycleStage = 
  | 'REGISTERED'
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'IN_OPERATION'
  | 'UNDER_MAINTENANCE'
  | 'RENTAL'
  | 'RETIRED';

export type OperationalStatus = 
  | 'OPERATIONAL'
  | 'AVAILABLE'
  | 'IDLE'
  | 'UNDER_MAINTENANCE'
  | 'ON_RENT'
  | 'RETIRED';

export interface Asset {
  id: string;
  assetId: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  year: number;
  status: OperationalStatus;
  lifecycleStage: LifecycleStage;
  location: string;
  latitude: number;
  longitude: number;
  utilization: number;
  fuelLevel: number;
  healthScore: number;
  operatingHours: number;
  serialNumber?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  assignments?: AssetAssignment[];
  maintenanceTasks?: MaintenanceTask[];
  rentals?: Rental[];
  activities?: ActivityLog[];
}

export interface Operator {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  status: 'ON_DUTY' | 'AVAILABLE' | 'ON_LEAVE' | 'TRAINING';
  certifications: string;
  safetyScore: number;
  shift: string;
  avatar?: string;
  assignments?: AssetAssignment[];
}

export interface AssetAssignment {
  id: string;
  assetId: string;
  operatorId: string;
  assignedAt: string;
  unassignedAt?: string;
  active: boolean;
  notes?: string;
  operator?: Operator;
  asset?: Asset;
}

export type MaintenancePriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type MaintenanceStatus = 'REPORTED' | 'INSPECTION_REQUIRED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';

export interface MaintenanceTask {
  id: string;
  assetId: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  technicianId?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  asset?: Asset;
  technician?: User;
}

export type RentalStatus = 'REQUESTED' | 'APPROVED' | 'ACTIVE' | 'EXTENSION_REQUESTED' | 'COMPLETED' | 'CANCELLED';

export interface Rental {
  id: string;
  assetId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  dailyRate: number;
  estimatedCost: number;
  actualCost?: number;
  paymentStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';
  notes?: string;
  createdAt: string;
  asset?: Asset;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  assetId?: string;
  activityType: string;
  description: string;
  metadata?: string;
  createdAt: string;
  user?: User;
  asset?: Asset;
}

export interface SmartAlert {
  id: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  assetId?: string;
  assetName?: string;
  timestamp: string;
}

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
  smartAlerts: SmartAlert[];
}

export interface OperationsOverviewData {
  metrics: FleetHealthMetrics;
  recentActivities: ActivityLog[];
  categoryBreakdown: Array<{ category: string; _count: { id: number } }>;
  statusBreakdown: Array<{ status: string; _count: { id: number } }>;
  upcomingMaintenance: MaintenanceTask[];
  activeRentals: Rental[];
}

export interface LiveEvent {
  id: string;
  type: string;
  assetId: string;
  assetName: string;
  message: string;
  location: string;
  time: string;
  status: string;
}

export interface LiveOperationsData {
  mapAssets: Asset[];
  liveFeed: LiveEvent[];
}

export interface SearchResult {
  type: 'ASSET' | 'OPERATOR' | 'MAINTENANCE' | 'RENTAL';
  id: string;
  title: string;
  subtitle: string;
  status: string;
  raw: any;
}
