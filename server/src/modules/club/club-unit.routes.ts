import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/rbac.middleware.js';
import {
    getClubUnits,
    createClubUnit,
    updateClubUnit,
    deleteClubUnit
} from './clubUnit.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/clubs/:clubId/units
 * List all units for a club
 */
router.get('/:clubId/units', requireRoles('SUPER_ADMIN', 'CLUB', 'COACH'), getClubUnits);

/**
 * POST /api/v1/clubs/:clubId/units
 * Create a new unit
 */
router.post('/:clubId/units', requireRoles('SUPER_ADMIN', 'CLUB'), createClubUnit);

/**
 * PUT /api/v1/clubs/units/:id
 * Update a unit
 */
router.put('/units/:id', requireRoles('SUPER_ADMIN', 'CLUB'), updateClubUnit);

/**
 * DELETE /api/v1/clubs/units/:id
 * Delete a unit
 */
router.delete('/units/:id', requireRoles('SUPER_ADMIN', 'CLUB'), deleteClubUnit);

export default router;
