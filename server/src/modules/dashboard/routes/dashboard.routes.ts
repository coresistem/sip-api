import { Router } from 'express';
import { getLayout, saveLayout } from '../controllers/DashboardController';
import { authenticate } from '../../../middleware/auth.middleware';

const router = Router();

// Semua route dashboard memerlukan login
router.get('/layout/:key', authenticate, getLayout);
router.post('/layout', authenticate, saveLayout);

export default router;
