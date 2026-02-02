
import { Request, Response } from 'express';
import { AthleteService } from './athlete.service';

const athleteService = new AthleteService();

export const AthleteController = {
    getPerformanceStats: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const stats = await athleteService.getPerformanceStats(id);
            res.json({ success: true, data: stats });
        } catch (error: any) {
            console.error('Get performance stats error:', error);
            res.status(500).json({ success: false, message: 'Failed to get performance stats' });
        }
    }
};
