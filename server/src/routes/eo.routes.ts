import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import * as eoController from '../controllers/eo.controller';

const router = Router();

router.get('/stats', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.getEOStats);
router.get('/events', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.getEOEvents);
// Note: /events/:id/export/ianseo is currently on event.routes.ts, maybe move it here? 
// For now, let's keep the export route where it is as it was working (assuming the path was correct).
// The export route in event.routes.ts is /:id/export/ianseo (mounted at /api/v1/events).
// Client called /api/v1/eo/events/:id/export/ianseo in EODashboard (Wait, I need to check my client code in Step 2156).

// Checking Step 2156: api.get(`/api/v1/eo/events/${eventId}/export/ianseo`
// This means the client expects the export route to be under /eo/events/...
// So I should proxy it here or move it.
// Actually, moving it here is cleaner.

router.get('/events/:id', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.getEventDetails);
router.get('/events/:id/export/ianseo', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.exportIanSEORegistrations);

import multer from 'multer';

// Configure Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });


router.post('/events', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.createEvent);
router.post('/events/:id/import/ianseo', authenticate, requireRole(['EO', 'SUPER_ADMIN']), upload.single('file'), eoController.importIanSEOResults);

// Category Management Routes
router.get('/events/:id/categories', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.getCategories);
router.post('/events/:id/categories', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.createCategory);
router.put('/events/:id/categories/:categoryId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.updateCategory);
router.delete('/events/:id/categories/:categoryId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.deleteCategory);

// Schedule Management Routes
// router.get('/events/:id/schedule', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.getEventSchedule);
// router.post('/events/:id/schedule', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.createScheduleItem);
router.delete('/events/:id/schedule/:itemId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.deleteScheduleItem);

// Budget Management Routes
router.get('/events/:id/budget', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.getBudget);
router.post('/events/:id/budget', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.createBudgetEntry);
router.put('/events/:id/budget/:entryId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.updateBudgetEntry);
router.delete('/events/:id/budget/:entryId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.deleteBudgetEntry);

// Timeline Routes
router.get('/events/:id/timeline', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.getTimeline);
router.post('/events/:id/timeline', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.createTimelineItem);
router.put('/events/:id/timeline/:itemId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.updateTimelineItem);
router.delete('/events/:id/timeline/:itemId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.deleteTimelineItem);

// Session & Target Layout Routes
router.get('/events/:id/sessions', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.getSessions);
router.post('/events/:id/sessions', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.createSession);
router.put('/events/:id/sessions/:sessionId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.updateSession);
router.delete('/events/:id/sessions/:sessionId', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.deleteSession);
router.post('/events/:id/sessions/:sessionId/allocations', authenticate, requireRole(['EO', 'SUPER_ADMIN']), eoController.saveSessionAllocations);

export default router;
