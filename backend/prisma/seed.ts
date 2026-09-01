import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CATFleet360 database seed...');

  // Clear existing
  await prisma.activityLog.deleteMany();
  await prisma.assetAssignment.deleteMany();
  await prisma.maintenanceTask.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.savedView.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const passwordHash = await bcrypt.hash('catfleet2026', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'admin@catfleet360.com',
      password: passwordHash,
      role: 'ADMINISTRATOR',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'manager@catfleet360.com',
      password: passwordHash,
      role: 'FLEET_MANAGER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const tech = await prisma.user.create({
    data: {
      name: 'Devon Miller',
      email: 'tech@catfleet360.com',
      password: passwordHash,
      role: 'TECHNICIAN',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  });

  console.log('✅ Users created.');

  // Create Assets
  const assetsData = [
    {
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
      notes: 'High fuel efficiency hydraulic pump. GPS tracking unit active.'
    },
    {
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
      notes: 'Equipped with Cat Grade 2D assist.'
    },
    {
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
      notes: 'Undergoing 3000-hour powertrain and track pin inspection.'
    },
    {
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
      notes: 'Active commercial rental with heavy material bucket attachment.'
    },
    {
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
      notes: 'Staged for next blasting haul run. Tire telemetry nominal.'
    },
    {
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
      notes: 'Laser leveling precision guide installed.'
    },
    {
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
      notes: 'Ready for deployment. Quick coupler verified.'
    }
  ];

  const createdAssets = [];
  for (const item of assetsData) {
    const asset = await prisma.asset.create({ data: item });
    createdAssets.push(asset);
  }
  console.log(`✅ ${createdAssets.length} Assets created.`);

  // Create Operators
  const op1 = await prisma.operator.create({
    data: {
      employeeId: 'OP-4102',
      name: 'Jackson Reed',
      email: 'j.reed@catfleet360.com',
      phone: '+1 (555) 234-5678',
      status: 'ON_DUTY',
      certifications: 'Heavy Excavator Level III, OSHA 30-Hour Construction, Cat Grade Assist Certified',
      safetyScore: 99.4,
      shift: 'Day Shift (06:00 - 14:30)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
    }
  });

  const op2 = await prisma.operator.create({
    data: {
      employeeId: 'OP-8821',
      name: 'Carlos Mendoza',
      email: 'c.mendoza@catfleet360.com',
      phone: '+1 (555) 345-6789',
      status: 'ON_DUTY',
      certifications: 'Track Dozer Master, GPS Blade Control, First Aid & CPR',
      safetyScore: 98.1,
      shift: 'Day Shift (06:00 - 14:30)',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80'
    }
  });

  const op3 = await prisma.operator.create({
    data: {
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
  });
  console.log('✅ Operators created.');

  // Create Asset Assignments
  await prisma.assetAssignment.create({
    data: {
      assetId: createdAssets[0].id,
      operatorId: op1.id,
      active: true,
      notes: 'Assigned for Sector 4 deep foundation dig.'
    }
  });

  await prisma.assetAssignment.create({
    data: {
      assetId: createdAssets[1].id,
      operatorId: op2.id,
      active: true,
      notes: 'Assigned for South Highway trenching.'
    }
  });

  // Create Maintenance Tasks across Kanban stages
  await prisma.maintenanceTask.create({
    data: {
      assetId: createdAssets[2].id, // D8T Dozer
      title: 'Hydraulic Cylinder Seal Replacement & Fluid Flush',
      description: 'Variance in main cylinder pressure telemetry (98.4 PSI). Replace seals and complete 3000-hr oil test.',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      technicianId: tech.id,
      scheduledDate: new Date(Date.now() - 86400000),
      cost: 3450.0,
      notes: 'Parts arrived from Cat dealer. Technician actively tearing down left side cylinder.'
    }
  });

  await prisma.maintenanceTask.create({
    data: {
      assetId: createdAssets[4].id, // 770G Truck
      title: 'Retarder Brake Caliper 1000-Hour Inspection',
      description: 'Scheduled multi-point brake line inspection and pad wear telemetry verification.',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      technicianId: tech.id,
      scheduledDate: new Date(Date.now() + 86400000 * 3),
      cost: 850.0,
      notes: 'Scheduled for next maintenance window.'
    }
  });

  await prisma.maintenanceTask.create({
    data: {
      assetId: createdAssets[0].id, // 320 GC Excavator
      title: 'Air Filter & Fuel Injector Cleaning',
      description: 'Sensor alert flagged slight intake flow restriction during dust storm shift.',
      priority: 'LOW',
      status: 'REPORTED',
      scheduledDate: new Date(Date.now() + 86400000 * 5),
      cost: 320.0
    }
  });

  await prisma.maintenanceTask.create({
    data: {
      assetId: createdAssets[5].id, // 140 GC Motor Grader
      title: 'Circle Drive Gearbox Fluid Replacement',
      description: 'Routine 500-hour blade rotation drive fluid renewal and seal torque check.',
      priority: 'HIGH',
      status: 'COMPLETED',
      technicianId: tech.id,
      scheduledDate: new Date(Date.now() - 86400000 * 4),
      completedDate: new Date(Date.now() - 86400000 * 2),
      cost: 620.0,
      notes: 'Completed with OEM Cat fluids. Passed pressure certification.'
    }
  });
  console.log('✅ Maintenance tasks created.');

  // Create Rentals
  await prisma.rental.create({
    data: {
      assetId: createdAssets[3].id, // 950 GC Wheel Loader
      customerName: 'Turner Infrastructure Corp',
      customerEmail: 'equipment@turnerconstruction.com',
      customerPhone: '+1 (415) 555-9012',
      startDate: new Date(Date.now() - 86400000 * 5),
      endDate: new Date(Date.now() + 86400000 * 10),
      status: 'ACTIVE',
      dailyRate: 580.0,
      estimatedCost: 8700.0,
      paymentStatus: 'PARTIALLY_PAID',
      notes: 'Includes high-capacity material bucket and telemetry link for jobsite foreman.'
    }
  });

  await prisma.rental.create({
    data: {
      assetId: createdAssets[6].id, // 420 XE Backhoe
      customerName: 'Pacific Bay Utilities LLC',
      customerEmail: 'rentals@pacificbay.com',
      customerPhone: '+1 (415) 555-7788',
      startDate: new Date(Date.now() + 86400000 * 2),
      endDate: new Date(Date.now() + 86400000 * 8),
      status: 'APPROVED',
      dailyRate: 420.0,
      estimatedCost: 2520.0,
      paymentStatus: 'PAID',
      notes: 'Delivery scheduled to Redwood City substation.'
    }
  });
  console.log('✅ Rentals created.');

  // Create Activity Logs
  const activities = [
    {
      userId: manager.id,
      assetId: createdAssets[0].id,
      activityType: 'ASSET_ASSIGNED',
      description: 'CAT 320 GC Excavator assigned to Operator Jackson Reed on Shift 1'
    },
    {
      userId: tech.id,
      assetId: createdAssets[2].id,
      activityType: 'MAINTENANCE_SCHEDULED',
      description: 'Critical Work Order opened for CAT D8T Dozer - Hydraulic cylinder rebuild'
    },
    {
      userId: manager.id,
      assetId: createdAssets[3].id,
      activityType: 'RENTAL_STARTED',
      description: 'CAT 950 GC Wheel Loader dispatched to Turner Infrastructure Corp (15-day contract)'
    },
    {
      userId: tech.id,
      assetId: createdAssets[5].id,
      activityType: 'MAINTENANCE_COMPLETED',
      description: 'Scheduled service completed on CAT 140 GC Motor Grader - Gearbox fluid changed'
    },
    {
      userId: admin.id,
      assetId: createdAssets[1].id,
      activityType: 'LIFECYCLE_CHANGED',
      description: 'Lifecycle state updated: AVAILABLE ➔ ASSIGNED for Highway Expansion contract'
    }
  ];

  for (const act of activities) {
    await prisma.activityLog.create({ data: act });
  }

  // Create Saved Views
  await prisma.savedView.create({
    data: {
      userId: admin.id,
      name: 'High Utilization Machinery',
      minUtil: 75.0,
      isDefault: true
    }
  });

  await prisma.savedView.create({
    data: {
      userId: admin.id,
      name: 'Assets Needing Maintenance',
      status: 'UNDER_MAINTENANCE'
    }
  });

  console.log('🎉 CATFleet360 seed finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
