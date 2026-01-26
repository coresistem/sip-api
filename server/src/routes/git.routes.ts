import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import * as gitController from '../controllers/git.controller.js';

const router = Router();

// Retrieve commit history
// GET /api/git/history
router.get('/history', authenticate, gitController.getHistory);

// Restore to a specific commit
// POST /api/git/restore
router.post('/restore', authenticate, gitController.restoreCommit);

export default router;
