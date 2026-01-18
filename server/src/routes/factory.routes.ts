import { Router } from 'express';
import * as factoryController from '../controllers/factory.controller.js';
import { authenticate, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// ============================================
// SYSTEM PARTS (Warehouse) - Super Admin only
// ============================================

// Get all parts (public for preview, but filtered by auth)
router.get('/parts', authenticate, factoryController.getParts);

// Get single part
router.get('/parts/:code', authenticate, factoryController.getPartByCode);

// Create, Update, Delete - Super Admin only
router.post('/parts', authenticate, requireRole(['SUPER_ADMIN']), factoryController.createPart);
router.put('/parts/:code', authenticate, requireRole(['SUPER_ADMIN']), factoryController.updatePart);
router.delete('/parts/:code', authenticate, requireRole(['SUPER_ADMIN']), factoryController.deletePart);

// ============================================
// FEATURE ASSEMBLIES - Super Admin only
// ============================================

// Get all assemblies
router.get('/assemblies', authenticate, requireRole(['SUPER_ADMIN']), factoryController.getAssemblies);

// Get single assembly
router.get('/assemblies/:id', authenticate, requireRole(['SUPER_ADMIN']), factoryController.getAssemblyById);

// Create, Update, Delete
router.post('/assemblies', authenticate, requireRole(['SUPER_ADMIN']), factoryController.createAssembly);
router.put('/assemblies/:id', authenticate, requireRole(['SUPER_ADMIN']), factoryController.updateAssembly);
router.delete('/assemblies/:id', authenticate, requireRole(['SUPER_ADMIN']), factoryController.deleteAssembly);

// Manage parts in assembly
router.post('/assemblies/:id/parts', authenticate, requireRole(['SUPER_ADMIN']), factoryController.addPartToAssembly);
router.delete('/assemblies/:id/parts/:featurePartId', authenticate, requireRole(['SUPER_ADMIN']), factoryController.removePartFromAssembly);
router.put('/assemblies/:id/parts/:featurePartId', authenticate, requireRole(['SUPER_ADMIN']), factoryController.updateFeaturePart);

// Workflow actions
router.post('/assemblies/:id/approve', authenticate, requireRole(['SUPER_ADMIN']), factoryController.approveAssembly);
router.post('/assemblies/:id/deploy', authenticate, requireRole(['SUPER_ADMIN']), factoryController.deployAssembly);
router.post('/assemblies/:id/rollback', authenticate, requireRole(['SUPER_ADMIN']), factoryController.rollbackAssembly);
router.post('/assemblies/:id/revert', authenticate, requireRole(['SUPER_ADMIN']), factoryController.revertToDraft);

export default router;
