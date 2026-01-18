import { Request, Response } from 'express';
import {
    getProvinceList,
    getCitiesByProvinceId,
    getProvinceById,
    searchProvinces,
} from '../data/indonesia-locations.js';

/**
 * Get all provinces
 * GET /api/v1/locations/provinces
 */
export const getProvinces = async (_req: Request, res: Response) => {
    try {
        const provinces = getProvinceList();

        return res.json({
            success: true,
            data: provinces,
            count: provinces.length,
        });
    } catch (error) {
        console.error('Get provinces error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch provinces',
        });
    }
};

/**
 * Get cities by province ID
 * GET /api/v1/locations/cities/:provinceId
 */
export const getCities = async (req: Request, res: Response) => {
    try {
        const { provinceId } = req.params;

        if (!provinceId) {
            return res.status(400).json({
                success: false,
                message: 'Province ID is required',
            });
        }

        const province = getProvinceById(provinceId);
        if (!province) {
            return res.status(404).json({
                success: false,
                message: 'Province not found',
            });
        }

        const cities = getCitiesByProvinceId(provinceId);

        return res.json({
            success: true,
            data: {
                province: {
                    id: province.id,
                    name: province.name,
                },
                cities,
            },
            count: cities.length,
        });
    } catch (error) {
        console.error('Get cities error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch cities',
        });
    }
};

/**
 * Search provinces by name
 * GET /api/v1/locations/provinces/search?q=...
 */
export const searchProvincesHandler = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters',
            });
        }

        const provinces = searchProvinces(query);

        return res.json({
            success: true,
            data: provinces.map(p => ({ id: p.id, name: p.name })),
            count: provinces.length,
        });
    } catch (error) {
        console.error('Search provinces error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to search provinces',
        });
    }
};
