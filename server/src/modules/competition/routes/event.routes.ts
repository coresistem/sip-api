
import { Router } from 'express';
import { authenticate, requireRole } from '../../../middleware/auth.middleware';
import * as eventController from '../controllers/event.controller';

const router = Router();

// Public / Shared
router.get('/', eventController.getCompetitions);
router.get('/:id', authenticate, eventController.getCompetitionDetails); // Authenticated to check own status

// EO Mgmt
router.post('/', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eventController.createCompetition);
router.post('/:id/categories', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eventController.addCategory);
router.post('/:id/categories', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eventController.addCategory);

// Public / Shared
router.get('/:id/leaderboard', eventController.getLeaderboard); // Public access for results

// Athlete Actions
router.post('/register', authenticate, requireRole(['ATHLETE']), eventController.registerAthlete);

export default router;
