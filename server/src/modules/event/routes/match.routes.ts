import { Router } from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireRoles } from '../../../middleware/rbac.middleware.js';
import * as matchController from '../controllers/match.controller.js';

const router = Router();
router.use(authenticate);

// Generate bracket for a category (EO/Admin/Judge only)
router.post('/generate', requireRoles('SUPER_ADMIN', 'EO', 'JUDGE'), matchController.generateBracket);

// Get bracket matches
router.get('/:id/category/:categoryId', matchController.getBracket);

// Update match score (Judge/Admin)
router.patch('/:id/score', requireRoles('SUPER_ADMIN', 'JUDGE', 'EO'), matchController.updateMatchScore);

export default router;
