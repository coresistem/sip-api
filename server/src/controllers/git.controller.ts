import { Request, Response } from 'express';
import { gitService } from '../services/git.service.js';

export const getHistory = async (req: Request, res: Response) => {
    try {
        console.log('[GitController] getHistory called');
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
        console.log('[GitController] Calling gitService.getHistory with limit:', limit);
        const history = await gitService.getHistory(limit);
        console.log('[GitController] History retrieved, count:', history.length);

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error('Error fetching git history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch git history'
        });
    }
};

export const restoreCommit = async (req: Request, res: Response) => {
    try {
        const { hash } = req.body;

        if (!hash) {
            return res.status(400).json({
                success: false,
                message: 'Commit hash is required'
            });
        }

        // Only allow Super Admin (already checked by middleware, but good to be safe)
        if (req.user?.role !== 'SUPER_ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized'
            });
        }

        await gitService.checkout(hash);

        res.json({
            success: true,
            message: `Successfully restored to commit ${hash}. The server may process needs to be restarted if backend code has changed.`
        });
    } catch (error: any) {
        console.error('Error restoring commit:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to restore commit'
        });
    }
};
