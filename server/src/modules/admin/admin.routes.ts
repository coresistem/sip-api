import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';
import {
    getRoleModules,
    updateRoleModuleConfig,
    batchUpdateRoleModules,
    getMyEnabledModules
} from './admin.controller.js';

const router = Router();

// ==========================================
// ROLE MODULE CONFIGURATION ROUTES
// ==========================================

// Get my enabled modules (Authenticated User)
router.get('/role-modules/my-modules', authenticate, getMyEnabledModules);

// Get modules for specific role (Super Admin)
router.get('/role-modules/:role', authenticate, requireRole(['SUPER_ADMIN']), getRoleModules);

// Update single module (Super Admin)
router.put('/role-modules/:role/:moduleId', authenticate, requireRole(['SUPER_ADMIN']), updateRoleModuleConfig);

// Batch update modules (Super Admin)
router.post('/role-modules/:role/batch', authenticate, requireRole(['SUPER_ADMIN']), batchUpdateRoleModules);

export default router;
