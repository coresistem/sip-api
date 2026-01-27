import express from 'express';
import { authenticate } from '../../../middleware/auth.middleware.js';
import { getNotifications, markAsRead, markAllAsRead } from './notification.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/mark-all-read', markAllAsRead);

export default router;
