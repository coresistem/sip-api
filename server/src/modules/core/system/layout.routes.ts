import { Router } from 'express';
import { authenticate, requireRole } from '../../../middleware/auth.middleware.js';
import * as layoutController from './layout.controller.js';

const router = Router();

// Publicly readable for all authenticated users (to apply layout)
router.get('/:featureKey', authenticate, layoutController.getLayoutConfig);

// Management only for SUPER_ADMIN
router.get('/', authenticate, requireRole(['SUPER_ADMIN']), layoutController.getAllConfigs);
router.post('/:featureKey', authenticate, requireRole(['SUPER_ADMIN']), layoutController.updateLayoutConfig);

export default router;
