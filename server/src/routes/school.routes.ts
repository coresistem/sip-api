import { Router } from 'express';
import { body } from 'express-validator';
import * as schoolController from '../controllers/school.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public endpoints

/**
 * GET /api/v1/schools/search?q=...&provinceId=...
 * Search schools in SIP database
 */
router.get('/search', schoolController.searchSchools);

/**
 * GET /api/v1/schools/:sipId
 * Get school by SIP ID
 */
router.get('/:sipId', schoolController.getSchoolBySipId);

/**
 * POST /api/v1/schools/validate-url
 * Validate Kemendikdasmen URL
 */
router.post(
    '/validate-url',
    [body('url').isURL().withMessage('Valid URL is required')],
    schoolController.validateKemendikdasmenUrl
);

// Protected endpoints (require authentication)

/**
 * POST /api/v1/schools/claim
 * Claim school enrollment (for students/athletes)
 */
router.post(
    '/claim',
    authenticate,
    [
        body('schoolSipId').notEmpty().withMessage('School SIP ID is required'),
        body('nisn').optional().isLength({ min: 10, max: 10 }).withMessage('NISN must be 10 digits'),
    ],
    schoolController.claimSchool
);

/**
 * GET /api/v1/schools/students
 * Get My Students (School Admin)
 */
router.get(
    '/students',
    authenticate,
    schoolController.getMyStudents
);

/**
 * GET /api/v1/schools/o2sn/current
 * Get Active O2SN
 */
router.get(
    '/o2sn/current',
    authenticate,
    schoolController.getO2SNCompetitions
);

/**
 * POST /api/v1/schools/o2sn/register
 * Register to O2SN
 */
router.post(
    '/o2sn/register',
    authenticate,
    schoolController.registerStudentToO2SN
);

/**
 * GET /api/v1/schools/registrations
 * Get Registration History
 */
router.get(
    '/registrations',
    authenticate,
    schoolController.getMyRegistrations
);

export default router;
