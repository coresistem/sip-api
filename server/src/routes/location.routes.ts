import { Router } from 'express';
import * as locationController from '../controllers/location.controller.js';

const router = Router();

// Public endpoints (no authentication required)

/**
 * GET /api/v1/locations/provinces
 * Get all provinces
 */
router.get('/provinces', locationController.getProvinces);

/**
 * GET /api/v1/locations/provinces/search?q=...
 * Search provinces by name
 */
router.get('/provinces/search', locationController.searchProvincesHandler);

/**
 * GET /api/v1/locations/cities/:provinceId
 * Get cities by province ID
 */
router.get('/cities/:provinceId', locationController.getCities);

export default router;
