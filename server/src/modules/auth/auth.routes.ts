import { Router } from 'express';

import * as authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware.js';

// Validation schemas
const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email required'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
});

const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
        role: z.enum(['ATHLETE', 'PARENT', 'COACH', 'PERPANI', 'CLUB', 'SCHOOL', 'JUDGE', 'EO', 'SUPPLIER', 'MANPOWER']).optional(),
        provinceId: z.string().optional(),
        cityId: z.string().optional(),
        whatsapp: z.string().optional(),
    }),
});

const selfRegisterSchema = z.object({
    body: z.object({
        email: z.string().email('Valid email required'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
        phone: z.string().min(10, 'Valid phone number required'),
        clubId: z.string().min(1, 'Club selection is required'),
    }),
});

// Routes
router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/self-register', validate(selfRegisterSchema), authController.selfRegister);
router.get('/clubs', authController.getClubs); // Public club list for registration
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);
router.patch('/password', authenticate, authController.changePassword);
router.get('/simulate/:role', authenticate, authController.simulateRole);
router.get('/simulate-user/:coreId', authenticate, authController.simulateUser);
router.get('/search-users', authenticate, authController.searchUsers);
router.get('/preview-core-id', authController.previewCoreId); // Public route for onboarding
router.get('/check-email', authController.checkEmail); // Public route for multi-role flow
router.patch('/switch-role', authenticate, authController.switchRole);

export default router;
