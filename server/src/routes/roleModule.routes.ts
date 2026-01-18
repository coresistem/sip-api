import { Router } from 'express';
import * as roleModuleController from '../controllers/roleModule.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Get modules configured for current user's role (for sidebar rendering)
// Any authenticated user can access their own role's enabled modules
router.get('/my-modules', authenticate, roleModuleController.getEnabledModulesForRole);

// Get all modules with config status for a specific role
// Super Admin only
router.get('/:role', authenticate, requireRole(['SUPER_ADMIN']), roleModuleController.getRoleModules);

// Update single module config for a role
// Super Admin only
router.put('/:role/:moduleId', authenticate, requireRole(['SUPER_ADMIN']), roleModuleController.updateRoleModuleConfig);

// Batch update modules for a role
// Super Admin only
router.post('/:role/batch', authenticate, requireRole(['SUPER_ADMIN']), roleModuleController.batchUpdateRoleModules);

export default router;
