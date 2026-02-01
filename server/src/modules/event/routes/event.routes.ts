
import { Router } from 'express';
import { authenticate, requireRole } from '../../../middleware/auth.middleware';
import * as eventController from '../controllers/event.controller';

const router = Router();

// Public / Shared
router.get('/', eventController.getCompetitions);
router.get('/:id', authenticate, eventController.getCompetitionDetails); // Authenticated to check own status

import multer from 'multer';

// Configure Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

// EO Mgmt
router.post('/', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eventController.createCompetition);
router.post('/:id/categories', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eventController.addCategory);

// Import / Export
router.get('/:id/export/ianseo', eventController.exportIanSEORegistrations);
router.post('/:id/import/ianseo', authenticate, requireRole(['EO', 'SUPER_ADMIN']), upload.single('file'), eventController.importIanSEORegistrations);

// Public / Shared
router.get('/:id/leaderboard', eventController.getLeaderboard); // Public access for results

// Athlete Actions
router.post('/register', authenticate, requireRole(['ATHLETE']), eventController.registerAthlete);

export default router;
