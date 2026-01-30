import { Router } from 'express';
import * as coachController from './coach.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { requireRoles } from '../../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticate);

// Coach Self-Management
router.get('/me', requireRoles('COACH', 'SUPER_ADMIN'), coachController.getMyCoachProfile);
router.post('/certification', requireRoles('COACH', 'SUPER_ADMIN'), coachController.updateCertification);

// Perpani Verification
router.get('/pending', requireRoles('PERPANI', 'SUPER_ADMIN'), coachController.getPendingCoaches);
router.post('/:id/verify', requireRoles('PERPANI', 'SUPER_ADMIN'), coachController.verifyCoach);

export default router;
