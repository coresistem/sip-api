
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import { scoringController } from './controllers/scoring.controller.js';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ success: true, message: 'Scoring Plugin is Active', version: 'V3.0' });
});

router.use(authenticate);

router.post('/submit', requireRoles('SUPER_ADMIN', 'CLUB', 'COACH', 'ATHLETE'), scoringController.submitScore);
router.get('/my-scores', requireRoles('ATHLETE'), scoringController.getMyScores);

export default router;
