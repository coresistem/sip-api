import { Request, Response } from 'express';
import prisma from '../../../lib/prisma.js';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id; // Authenticated user
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId
            },
            take: limit,
            orderBy: {
                createdAt: 'desc'
            }
        });

        const unreadCount = await prisma.notification.count({
            where: {
                userId: userId,
                isRead: false
            }
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const notification = await prisma.notification.findFirst({
            where: {
                id,
                userId
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        res.json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification'
        });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.id;

        await prisma.notification.updateMany({
            where: {
                userId,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notifications'
        });
    }
};
