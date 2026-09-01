import { Router } from 'express';
import * as authCtrl from '../controllers/authController';
import * as assetCtrl from '../controllers/assetController';
import * as maintCtrl from '../controllers/maintenanceController';
import * as rentalCtrl from '../controllers/rentalController';
import * as opCtrl from '../controllers/operatorController';
import * as actCtrl from '../controllers/activityController';
import * as dashCtrl from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Auth Routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticate, authCtrl.getMe);

// Dashboard & Overview Routes
router.get('/dashboard/overview', dashCtrl.getOperationsOverview);
router.get('/dashboard/live', dashCtrl.getLiveOperations);
router.get('/dashboard/search', dashCtrl.globalSearch);

// Asset Routes
router.get('/assets', assetCtrl.getAssets);
router.get('/assets/:id', assetCtrl.getAssetById);
router.post('/assets', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), assetCtrl.createAsset);
router.put('/assets/:id', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), assetCtrl.updateAsset);
router.patch('/assets/:id/lifecycle', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), assetCtrl.updateAssetLifecycle);
router.delete('/assets/:id', authenticate, authorize(['ADMINISTRATOR']), assetCtrl.deleteAsset);

// Maintenance Routes
router.get('/maintenance', maintCtrl.getMaintenanceTasks);
router.post('/maintenance', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER', 'TECHNICIAN']), maintCtrl.createMaintenanceTask);
router.patch('/maintenance/:id/status', authenticate, maintCtrl.updateMaintenanceStatus);
router.patch('/maintenance/:id/assign', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), maintCtrl.assignTechnician);

// Rental Routes
router.get('/rentals', rentalCtrl.getRentals);
router.post('/rentals', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), rentalCtrl.createRental);
router.patch('/rentals/:id/status', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), rentalCtrl.updateRentalStatus);

// Operator Routes
router.get('/operators', opCtrl.getOperators);
router.post('/operators', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), opCtrl.createOperator);
router.post('/operators/assign', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), opCtrl.assignAssetToOperator);
router.delete('/operators/assign/:assignmentId', authenticate, authorize(['ADMINISTRATOR', 'FLEET_MANAGER']), opCtrl.unassignAsset);

// Activity Logs
router.get('/activities', actCtrl.getActivityLogs);

export default router;
