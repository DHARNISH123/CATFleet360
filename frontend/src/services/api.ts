import axios from 'axios';
import {
  Asset,
  Operator,
  MaintenanceTask,
  Rental,
  ActivityLog,
  OperationsOverviewData,
  LiveOperationsData,
  SearchResult,
  User,
  Role
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('catfleet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback Mock Data in case backend is offline during initial frontend preview
export const mockAssets: Asset[] = [
  {
    id: 'ast-1',
    assetId: 'CAT-EX-205',
    name: 'CAT 320 GC Hydraulic Excavator',
    category: 'Hydraulic Excavator',
    manufacturer: 'Caterpillar',
    model: '320 GC',
    year: 2023,
    status: 'OPERATIONAL',
    lifecycleStage: 'IN_OPERATION',
    location: 'Jobsite Alpha - Quarry Sector',
    latitude: 37.7833,
    longitude: -122.4167,
    utilization: 88.5,
    fuelLevel: 76.0,
    healthScore: 94.0,
    operatingHours: 1840.5,
    serialNumber: 'CAT-320GC-9921A',
    imageUrl: '/assets/equipment/cat_320gc.jpg',
    notes: 'High fuel efficiency hydraulic pump. GPS tracking unit active.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-2',
    assetId: 'CAT-EX-349',
    name: 'CAT 349 Next Gen Large Excavator',
    category: 'Hydraulic Excavator',
    manufacturer: 'Caterpillar',
    model: '349 Next Gen',
    year: 2024,
    status: 'OPERATIONAL',
    lifecycleStage: 'ASSIGNED',
    location: 'South Highway Expansion',
    latitude: 37.7558,
    longitude: -122.4449,
    utilization: 91.2,
    fuelLevel: 82.0,
    healthScore: 98.0,
    operatingHours: 620.0,
    serialNumber: 'CAT-349NG-4412B',
    imageUrl: '/assets/equipment/cat_349.jpg',
    notes: 'Equipped with Cat Grade 2D assist.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-3',
    assetId: 'CAT-DZ-801',
    name: 'CAT D8T Heavy Track Dozer',
    category: 'Track Type Tractor',
    manufacturer: 'Caterpillar',
    model: 'D8T',
    year: 2022,
    status: 'UNDER_MAINTENANCE',
    lifecycleStage: 'UNDER_MAINTENANCE',
    location: 'West Maintenance Bay 2',
    latitude: 37.7690,
    longitude: -122.4467,
    utilization: 32.0,
    fuelLevel: 45.0,
    healthScore: 68.0,
    operatingHours: 3410.0,
    serialNumber: 'CAT-D8T-7719K',
    imageUrl: '/assets/equipment/cat_d8t.jpg',
    notes: 'Undergoing 3000-hour powertrain and track pin inspection.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-4',
    assetId: 'CAT-WL-950',
    name: 'CAT 950 GC Wheel Loader',
    category: 'Wheel Loader',
    manufacturer: 'Caterpillar',
    model: '950 GC',
    year: 2023,
    status: 'ON_RENT',
    lifecycleStage: 'RENTAL',
    location: 'Turner Construction - Bay Pier',
    latitude: 37.7915,
    longitude: -122.3920,
    utilization: 84.0,
    fuelLevel: 62.0,
    healthScore: 92.0,
    operatingHours: 1420.0,
    serialNumber: 'CAT-950GC-1192M',
    imageUrl: '/assets/equipment/cat_950gc.jpg',
    notes: 'Active commercial rental with heavy material bucket attachment.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-5',
    assetId: 'CAT-TR-770',
    name: 'CAT 770G Off-Highway Haul Truck',
    category: 'Off-Highway Truck',
    manufacturer: 'Caterpillar',
    model: '770G',
    year: 2023,
    status: 'IDLE',
    lifecycleStage: 'AVAILABLE',
    location: 'West Quarry Pit A',
    latitude: 37.7420,
    longitude: -122.4080,
    utilization: 18.5,
    fuelLevel: 94.0,
    healthScore: 96.0,
    operatingHours: 2100.0,
    serialNumber: 'CAT-770G-5501H',
    imageUrl: '/assets/equipment/cat_770g.jpg',
    notes: 'Staged for next blasting haul run. Tire telemetry nominal.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-6',
    assetId: 'CAT-MG-140',
    name: 'CAT 140 GC Motor Grader',
    category: 'Motor Grader',
    manufacturer: 'Caterpillar',
    model: '140 GC',
    year: 2024,
    status: 'OPERATIONAL',
    lifecycleStage: 'IN_OPERATION',
    location: 'South Highway Expansion',
    latitude: 37.7600,
    longitude: -122.4300,
    utilization: 78.0,
    fuelLevel: 58.0,
    healthScore: 95.0,
    operatingHours: 890.0,
    serialNumber: 'CAT-140GC-8840Z',
    imageUrl: '/assets/equipment/cat_140gc.jpg',
    notes: 'Laser leveling precision guide installed.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ast-7',
    assetId: 'CAT-BH-420',
    name: 'CAT 420 XE Backhoe Loader',
    category: 'Backhoe Loader',
    manufacturer: 'Caterpillar',
    model: '420 XE',
    year: 2023,
    status: 'AVAILABLE',
    lifecycleStage: 'AVAILABLE',
    location: 'Central Equipment Yard',
    latitude: 37.7720,
    longitude: -122.4100,
    utilization: 64.0,
    fuelLevel: 88.0,
    healthScore: 97.0,
    operatingHours: 950.0,
    serialNumber: 'CAT-420XE-3019X',
    imageUrl: '/assets/equipment/cat_420xe.jpg',
    notes: 'Ready for deployment. Quick coupler verified.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockOperators: Operator[] = [
  {
    id: 'op-1',
    employeeId: 'OP-4102',
    name: 'Jackson Reed',
    email: 'j.reed@catfleet360.com',
    phone: '+1 (555) 234-5678',
    status: 'ON_DUTY',
    certifications: 'Heavy Excavator Level III, OSHA 30-Hour Construction, Cat Grade Assist Certified',
    safetyScore: 99.4,
    shift: 'Day Shift (06:00 - 14:30)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'op-2',
    employeeId: 'OP-8821',
    name: 'Carlos Mendoza',
    email: 'c.mendoza@catfleet360.com',
    phone: '+1 (555) 345-6789',
    status: 'ON_DUTY',
    certifications: 'Track Dozer Master, GPS Blade Control, First Aid & CPR',
    safetyScore: 98.1,
    shift: 'Day Shift (06:00 - 14:30)',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'op-3',
    employeeId: 'OP-3319',
    name: 'Samantha Ray',
    email: 's.ray@catfleet360.com',
    phone: '+1 (555) 456-7890',
    status: 'AVAILABLE',
    certifications: 'Articulated Haul Truck Certified, Motor Grader Level II',
    safetyScore: 97.8,
    shift: 'Swing Shift (14:00 - 22:30)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: 'task-1',
    assetId: 'ast-3',
    title: 'Hydraulic Cylinder Seal Replacement & Fluid Flush',
    description: 'Variance in main cylinder pressure telemetry (98.4 PSI). Replace seals and complete 3000-hr oil test.',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    technicianId: 'tech-1',
    scheduledDate: new Date(Date.now() - 86400000).toISOString(),
    cost: 3450.0,
    notes: 'Parts arrived from Cat dealer. Technician actively tearing down left side cylinder.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    asset: mockAssets[2],
  },
  {
    id: 'task-2',
    assetId: 'ast-5',
    title: 'Retarder Brake Caliper 1000-Hour Inspection',
    description: 'Scheduled multi-point brake line inspection and pad wear telemetry verification.',
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    technicianId: 'tech-1',
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    cost: 850.0,
    notes: 'Scheduled for next maintenance window.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    asset: mockAssets[4],
  },
  {
    id: 'task-3',
    assetId: 'ast-1',
    title: 'Air Filter & Fuel Injector Cleaning',
    description: 'Sensor alert flagged slight intake flow restriction during dust storm shift.',
    priority: 'LOW',
    status: 'REPORTED',
    scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    cost: 320.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    asset: mockAssets[0],
  },
  {
    id: 'task-4',
    assetId: 'ast-6',
    title: 'Circle Drive Gearbox Fluid Replacement',
    description: 'Routine 500-hour blade rotation drive fluid renewal and seal torque check.',
    priority: 'HIGH',
    status: 'COMPLETED',
    technicianId: 'tech-1',
    scheduledDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    completedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    cost: 620.0,
    notes: 'Completed with OEM Cat fluids. Passed pressure certification.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    asset: mockAssets[5],
  }
];

export const mockRentals: Rental[] = [
  {
    id: 'rent-1',
    assetId: 'ast-4',
    customerName: 'Turner Infrastructure Corp',
    customerEmail: 'equipment@turnerconstruction.com',
    customerPhone: '+1 (415) 555-9012',
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: 'ACTIVE',
    dailyRate: 580.0,
    estimatedCost: 8700.0,
    paymentStatus: 'PARTIALLY_PAID',
    notes: 'Includes high-capacity material bucket and telemetry link for jobsite foreman.',
    createdAt: new Date().toISOString(),
    asset: mockAssets[3]
  },
  {
    id: 'rent-2',
    assetId: 'ast-7',
    customerName: 'Pacific Bay Utilities LLC',
    customerEmail: 'rentals@pacificbay.com',
    customerPhone: '+1 (415) 555-7788',
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 8).toISOString(),
    status: 'APPROVED',
    dailyRate: 420.0,
    estimatedCost: 2520.0,
    paymentStatus: 'PAID',
    notes: 'Delivery scheduled to Redwood City substation.',
    createdAt: new Date().toISOString(),
    asset: mockAssets[6]
  }
];

export const mockActivities: ActivityLog[] = [
  {
    id: 'act-1',
    activityType: 'ASSET_ASSIGNED',
    description: 'CAT 320 GC Excavator assigned to Operator Jackson Reed on Shift 1',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    asset: mockAssets[0]
  },
  {
    id: 'act-2',
    activityType: 'MAINTENANCE_SCHEDULED',
    description: 'Critical Work Order opened for CAT D8T Dozer - Hydraulic cylinder rebuild',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    asset: mockAssets[2]
  },
  {
    id: 'act-3',
    activityType: 'RENTAL_STARTED',
    description: 'CAT 950 GC Wheel Loader dispatched to Turner Infrastructure Corp (15-day contract)',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    asset: mockAssets[3]
  },
  {
    id: 'act-4',
    activityType: 'MAINTENANCE_COMPLETED',
    description: 'Scheduled service completed on CAT 140 GC Motor Grader - Gearbox fluid changed',
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    asset: mockAssets[5]
  },
  {
    id: 'act-5',
    activityType: 'LIFECYCLE_CHANGED',
    description: 'Lifecycle state updated: AVAILABLE ➔ ASSIGNED for Highway Expansion contract',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    asset: mockAssets[1]
  }
];

// Comprehensive API service
export const apiService = {
  // Auth
  async login(email: string, password: string) {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } catch {
      return {
        token: 'mock-jwt-token',
        user: { id: 'usr-1', name: 'Elena Rostova', email, role: 'ADMINISTRATOR' as Role }
      };
    }
  },

  async getMe() {
    try {
      const res = await api.get('/auth/me');
      return res.data.user;
    } catch {
      return { id: 'usr-1', name: 'Elena Rostova', email: 'admin@catfleet360.com', role: 'ADMINISTRATOR' as Role };
    }
  },

  // Dashboard Overview
  async getOverview(): Promise<OperationsOverviewData> {
    try {
      const res = await api.get('/dashboard/overview');
      return res.data;
    } catch {
      return {
        metrics: {
          healthScore: 89,
          totalAssets: mockAssets.length,
          operationalCount: mockAssets.filter(a => a.status === 'OPERATIONAL' || a.status === 'AVAILABLE').length,
          availabilityRate: 86,
          inMaintenanceCount: 1,
          onRentCount: 1,
          idleCount: 1,
          averageUtilization: 68,
          overdueMaintenanceCount: 1,
          smartAlerts: [
            {
              id: 'alt-1',
              type: 'CRITICAL',
              title: 'Overdue Maintenance: CAT D8T Heavy Track Dozer',
              description: 'Hydraulic cylinder rebuild is past scheduled target window.',
              assetId: 'CAT-DZ-801',
              assetName: 'CAT D8T Heavy Track Dozer',
              timestamp: new Date().toISOString()
            },
            {
              id: 'alt-2',
              type: 'WARNING',
              title: 'Low Machine Utilization Warning',
              description: 'CAT 770G Haul Truck has remained idle for 3+ hours at West Quarry.',
              assetId: 'CAT-TR-770',
              assetName: 'CAT 770G Off-Highway Haul Truck',
              timestamp: new Date().toISOString()
            }
          ]
        },
        recentActivities: mockActivities,
        categoryBreakdown: [
          { category: 'Hydraulic Excavator', _count: { id: 2 } },
          { category: 'Track Type Tractor', _count: { id: 1 } },
          { category: 'Wheel Loader', _count: { id: 1 } },
          { category: 'Off-Highway Truck', _count: { id: 1 } },
          { category: 'Motor Grader', _count: { id: 1 } },
          { category: 'Backhoe Loader', _count: { id: 1 } }
        ],
        statusBreakdown: [
          { status: 'OPERATIONAL', _count: { id: 3 } },
          { status: 'AVAILABLE', _count: { id: 2 } },
          { status: 'UNDER_MAINTENANCE', _count: { id: 1 } },
          { status: 'ON_RENT', _count: { id: 1 } }
        ],
        upcomingMaintenance: mockMaintenanceTasks,
        activeRentals: mockRentals
      };
    }
  },

  // Live Operations Map & Telemetry
  async getLiveOperations(): Promise<LiveOperationsData> {
    try {
      const res = await api.get('/dashboard/live');
      return res.data;
    } catch {
      return {
        mapAssets: mockAssets,
        liveFeed: [
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
            location: 'West Maintenance Bay 2',
            time: '12m ago',
            status: 'UNDER_MAINTENANCE'
          },
          {
            id: 'evt-4',
            type: 'RENTAL',
            assetId: 'CAT-WL-950',
            assetName: 'CAT 950 GC Wheel Loader',
            message: 'On-site rental handover completed with Turner Construction.',
            location: 'Turner Construction - Bay Pier',
            time: '26m ago',
            status: 'ON_RENT'
          }
        ]
      };
    }
  },

  // Assets
  async getAssets(params?: { category?: string; status?: string; lifecycleStage?: string; search?: string; minUtil?: number }) {
    try {
      const res = await api.get('/assets', { params });
      return res.data.assets as Asset[];
    } catch {
      let filtered = [...mockAssets];
      if (params?.category && params.category !== 'ALL') {
        filtered = filtered.filter(a => a.category === params.category);
      }
      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter(a => a.status === params.status);
      }
      if (params?.lifecycleStage && params.lifecycleStage !== 'ALL') {
        filtered = filtered.filter(a => a.lifecycleStage === params.lifecycleStage);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(a => a.name.toLowerCase().includes(q) || a.assetId.toLowerCase().includes(q) || a.location.toLowerCase().includes(q));
      }
      return filtered;
    }
  },

  async getAssetById(id: string) {
    try {
      const res = await api.get(`/assets/${id}`);
      return res.data.asset as Asset;
    } catch {
      return mockAssets.find(a => a.id === id || a.assetId === id) || mockAssets[0];
    }
  },

  async createAsset(data: Partial<Asset>) {
    try {
      const res = await api.post('/assets', data);
      return res.data.asset as Asset;
    } catch {
      const newAsset: Asset = {
        id: `ast-${Date.now()}`,
        assetId: data.assetId || `CAT-NEW-${Math.floor(100 + Math.random() * 900)}`,
        name: data.name || 'New Caterpillar Equipment',
        category: data.category || 'Hydraulic Excavator',
        manufacturer: 'Caterpillar',
        model: data.model || '320 GC',
        year: data.year || 2024,
        status: data.status || 'AVAILABLE',
        lifecycleStage: data.lifecycleStage || 'AVAILABLE',
        location: data.location || 'Central Equipment Yard',
        latitude: data.latitude || 37.7749,
        longitude: data.longitude || -122.4194,
        utilization: data.utilization || 0,
        fuelLevel: data.fuelLevel || 95,
        healthScore: data.healthScore || 100,
        operatingHours: data.operatingHours || 0,
        serialNumber: data.serialNumber || `CAT-SN-${Date.now().toString().slice(-6)}`,
        imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockAssets.unshift(newAsset);
      return newAsset;
    }
  },

  async updateAsset(id: string, data: Partial<Asset>) {
    try {
      const res = await api.put(`/assets/${id}`, data);
      return res.data.asset as Asset;
    } catch {
      const idx = mockAssets.findIndex(a => a.id === id);
      if (idx !== -1) {
        mockAssets[idx] = { ...mockAssets[idx], ...data, updatedAt: new Date().toISOString() };
        return mockAssets[idx];
      }
      return mockAssets[0];
    }
  },

  async updateLifecycle(id: string, lifecycleStage: string, reason?: string) {
    try {
      const res = await api.patch(`/assets/${id}/lifecycle`, { lifecycleStage, reason });
      return res.data.asset as Asset;
    } catch {
      const idx = mockAssets.findIndex(a => a.id === id);
      if (idx !== -1) {
        mockAssets[idx].lifecycleStage = lifecycleStage as any;
        return mockAssets[idx];
      }
      return mockAssets[0];
    }
  },

  async deleteAsset(id: string) {
    try {
      await api.delete(`/assets/${id}`);
      return true;
    } catch {
      const idx = mockAssets.findIndex(a => a.id === id);
      if (idx !== -1) mockAssets.splice(idx, 1);
      return true;
    }
  },

  // Maintenance Tasks
  async getMaintenanceTasks(params?: { status?: string; priority?: string }) {
    try {
      const res = await api.get('/maintenance', { params });
      return res.data.tasks as MaintenanceTask[];
    } catch {
      let filtered = [...mockMaintenanceTasks];
      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter(t => t.status === params.status);
      }
      if (params?.priority && params.priority !== 'ALL') {
        filtered = filtered.filter(t => t.priority === params.priority);
      }
      return filtered;
    }
  },

  async createMaintenanceTask(data: Partial<MaintenanceTask>) {
    try {
      const res = await api.post('/maintenance', data);
      return res.data.task as MaintenanceTask;
    } catch {
      const newTask: MaintenanceTask = {
        id: `task-${Date.now()}`,
        assetId: data.assetId || mockAssets[0].id,
        title: data.title || 'Scheduled Service',
        description: data.description || '',
        priority: data.priority || 'MEDIUM',
        status: data.status || 'REPORTED',
        technicianId: data.technicianId,
        scheduledDate: data.scheduledDate || new Date().toISOString(),
        cost: data.cost || 0,
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        asset: mockAssets.find(a => a.id === data.assetId) || mockAssets[0]
      };
      mockMaintenanceTasks.unshift(newTask);
      return newTask;
    }
  },

  async updateMaintenanceStatus(id: string, status: string, notes?: string, actualCost?: number) {
    try {
      const res = await api.patch(`/maintenance/${id}/status`, { status, notes, actualCost });
      return res.data.task as MaintenanceTask;
    } catch {
      const task = mockMaintenanceTasks.find(t => t.id === id);
      if (task) {
        task.status = status as any;
        if (notes) task.notes = notes;
        if (actualCost) task.cost = actualCost;
      }
      return task;
    }
  },

  // Rentals
  async getRentals(params?: { status?: string }) {
    try {
      const res = await api.get('/rentals', { params });
      return res.data.rentals as Rental[];
    } catch {
      let filtered = [...mockRentals];
      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter(r => r.status === params.status);
      }
      return filtered;
    }
  },

  async createRental(data: Partial<Rental>) {
    try {
      const res = await api.post('/rentals', data);
      return res.data.rental as Rental;
    } catch {
      const newRental: Rental = {
        id: `rent-${Date.now()}`,
        assetId: data.assetId || mockAssets[0].id,
        customerName: data.customerName || 'Standard Client',
        customerEmail: data.customerEmail || 'client@example.com',
        customerPhone: data.customerPhone,
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || new Date(Date.now() + 86400000 * 7).toISOString(),
        status: 'REQUESTED',
        dailyRate: data.dailyRate || 450,
        estimatedCost: (data.dailyRate || 450) * 7,
        paymentStatus: 'PENDING',
        notes: data.notes,
        createdAt: new Date().toISOString(),
        asset: mockAssets.find(a => a.id === data.assetId) || mockAssets[0]
      };
      mockRentals.unshift(newRental);
      return newRental;
    }
  },

  async updateRentalStatus(id: string, status: string, paymentStatus?: string) {
    try {
      const res = await api.patch(`/rentals/${id}/status`, { status, paymentStatus });
      return res.data.rental as Rental;
    } catch {
      const rental = mockRentals.find(r => r.id === id);
      if (rental) {
        rental.status = status as any;
        if (paymentStatus) rental.paymentStatus = paymentStatus as any;
      }
      return rental;
    }
  },

  // Operators
  async getOperators(params?: { status?: string; search?: string }) {
    try {
      const res = await api.get('/operators', { params });
      return res.data.operators as Operator[];
    } catch {
      let filtered = [...mockOperators];
      if (params?.status && params.status !== 'ALL') {
        filtered = filtered.filter(o => o.status === params.status);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(o => o.name.toLowerCase().includes(q) || o.employeeId.toLowerCase().includes(q));
      }
      return filtered;
    }
  },

  async createOperator(data: Partial<Operator>) {
    try {
      const res = await api.post('/operators', data);
      return res.data.operator as Operator;
    } catch {
      const newOp: Operator = {
        id: `op-${Date.now()}`,
        employeeId: data.employeeId || `OP-${Math.floor(1000 + Math.random() * 9000)}`,
        name: data.name || 'New Operator',
        email: data.email || 'operator@catfleet360.com',
        phone: data.phone || '+1 (555) 012-3456',
        status: data.status || 'AVAILABLE',
        certifications: data.certifications || 'General Heavy Equipment Certification',
        safetyScore: data.safetyScore || 98.0,
        shift: data.shift || 'Day Shift (06:00 - 14:30)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      };
      mockOperators.push(newOp);
      return newOp;
    }
  },

  async assignOperator(operatorId: string, assetId: string, notes?: string) {
    try {
      const res = await api.post('/operators/assign', { operatorId, assetId, notes });
      return res.data.assignment;
    } catch {
      const op = mockOperators.find(o => o.id === operatorId);
      const ast = mockAssets.find(a => a.id === assetId);
      if (op && ast) {
        op.status = 'ON_DUTY';
        ast.status = 'OPERATIONAL';
        ast.lifecycleStage = 'ASSIGNED';
      }
      return { id: `asgn-${Date.now()}`, operatorId, assetId, active: true };
    }
  },

  // Activity logs
  async getActivities(params?: { assetId?: string; activityType?: string }) {
    try {
      const res = await api.get('/activities', { params });
      return res.data.logs as ActivityLog[];
    } catch {
      return mockActivities;
    }
  },

  // Global Search
  async search(query: string): Promise<SearchResult[]> {
    try {
      const res = await api.get('/dashboard/search', { params: { q: query } });
      return res.data.results as SearchResult[];
    } catch {
      const q = query.toLowerCase();
      const results: SearchResult[] = [];
      mockAssets.filter(a => a.name.toLowerCase().includes(q) || a.assetId.toLowerCase().includes(q)).forEach(a => {
        results.push({ type: 'ASSET', id: a.id, title: `${a.name} (${a.assetId})`, subtitle: `${a.category} • ${a.location}`, status: a.status, raw: a });
      });
      mockOperators.filter(o => o.name.toLowerCase().includes(q) || o.employeeId.toLowerCase().includes(q)).forEach(o => {
        results.push({ type: 'OPERATOR', id: o.id, title: `${o.name} (${o.employeeId})`, subtitle: `${o.status} • ${o.shift}`, status: o.status, raw: o });
      });
      mockMaintenanceTasks.filter(t => t.title.toLowerCase().includes(q)).forEach(t => {
        results.push({ type: 'MAINTENANCE', id: t.id, title: t.title, subtitle: `Priority: ${t.priority} • ${t.status}`, status: t.status, raw: t });
      });
      mockRentals.filter(r => r.customerName.toLowerCase().includes(q)).forEach(r => {
        results.push({ type: 'RENTAL', id: r.id, title: `Rental: ${r.customerName}`, subtitle: `${r.status} • $${r.estimatedCost}`, status: r.status, raw: r });
      });
      return results;
    }
  }
};
