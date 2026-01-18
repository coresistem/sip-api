import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import {
    listModules,
    getModule,
    createModule,
    updateModule,
    deleteModule,
    addField,
    updateField,
    deleteField,
    createAssessment,
    getAssessment,
    listAssessments,
    generateFeedback
} from '../controllers/custom-module.controller';

const router = Router();

// ===========================================
// MODULE ROUTES (Requires Authentication)
// ===========================================

// List all modules - Any authenticated user can view ACTIVE modules
router.get('/modules', authenticate, listModules);

// Get module with fields - Any authenticated user
router.get('/modules/:id', authenticate, getModule);

// Create module - SuperAdmin only
router.post('/modules', authenticate, requireRole(['SUPER_ADMIN']), createModule);

// Update module - SuperAdmin only
router.put('/modules/:id', authenticate, requireRole(['SUPER_ADMIN']), updateModule);

// Delete (archive) module - SuperAdmin only
router.delete('/modules/:id', authenticate, requireRole(['SUPER_ADMIN']), deleteModule);

// ===========================================
// FIELD ROUTES (SuperAdmin only)
// ===========================================

// Add field to module
router.post('/modules/:id/fields', authenticate, requireRole(['SUPER_ADMIN']), addField);

// Update field
router.put('/modules/:moduleId/fields/:fieldId', authenticate, requireRole(['SUPER_ADMIN']), updateField);

// Delete field
router.delete('/modules/:moduleId/fields/:fieldId', authenticate, requireRole(['SUPER_ADMIN']), deleteField);

// ===========================================
// ASSESSMENT ROUTES
// ===========================================

// Create assessment - Coach, Club, School
router.post('/assessments', authenticate, requireRole(['COACH', 'CLUB', 'CLUB_OWNER', 'SCHOOL', 'SUPER_ADMIN']), createAssessment);

// Get assessment - Any authenticated user (with role check in controller if needed)
router.get('/assessments/:id', authenticate, getAssessment);

// List assessments - Filter by athlete, module, coach
router.get('/assessments', authenticate, listAssessments);

// Generate AI feedback - Coach, Club, School, SuperAdmin
router.post('/assessments/:id/feedback', authenticate, requireRole(['COACH', 'CLUB', 'CLUB_OWNER', 'SCHOOL', 'SUPER_ADMIN']), generateFeedback);

export default router;
