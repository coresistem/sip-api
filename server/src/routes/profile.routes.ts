import { Router } from 'express';
import { body } from 'express-validator';
import * as profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation rules for profile update
const updateProfileValidation = [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('phone').optional().trim().matches(/^(\+62|62|0)[0-9]{9,13}$/).withMessage('Invalid Indonesian phone number'),
    body('whatsapp').optional().trim().matches(/^(\+62|62|0)[0-9]{9,13}$/).withMessage('Invalid WhatsApp number'),
    body('provinceId').optional().trim().isLength({ min: 2, max: 10 }).withMessage('Invalid province ID'),
    body('cityId').optional().trim().isLength({ min: 2, max: 10 }).withMessage('Invalid city ID'),
    body('nik').optional().trim().isLength({ min: 16, max: 16 }).withMessage('NIK must be exactly 16 digits'),
    body('isStudent').optional().isBoolean().withMessage('isStudent must be a boolean'),
];

// Athlete-specific validation
const athleteDataValidation = [
    body('athleteData.dateOfBirth').optional().isISO8601().withMessage('Invalid date format'),
    body('athleteData.gender').optional().isIn(['MALE', 'FEMALE']).withMessage('Gender must be MALE or FEMALE'),
    body('athleteData.archeryCategory').optional().isIn(['RECURVE', 'COMPOUND', 'BAREBOW', 'TRADITIONAL', 'LONGBOW']).withMessage('Invalid archery category'),
    body('athleteData.skillLevel').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE']).withMessage('Invalid skill level'),
    body('athleteData.height').optional().isFloat({ min: 50, max: 250 }).withMessage('Height must be 50-250 cm'),
    body('athleteData.weight').optional().isFloat({ min: 20, max: 200 }).withMessage('Weight must be 20-200 kg'),
];

// Routes

/**
 * GET /api/v1/profile
 * Get current user's profile with role-specific data
 */
router.get('/', profileController.getProfile);

/**
 * PUT /api/v1/profile
 * Update current user's profile
 */
router.put('/', [...updateProfileValidation, ...athleteDataValidation], profileController.updateProfile);

/**
 * GET /api/v1/profile/:userId
 * Get a specific user's profile (admin only)
 */
router.get('/:userId', profileController.getUserProfile);

/**
 * POST /api/v1/profile/avatar
 * Update user avatar
 */
router.post('/avatar', profileController.updateAvatar);

export default router;
