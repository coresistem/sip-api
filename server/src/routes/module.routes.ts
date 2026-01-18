
import { Router } from 'express';
import * as moduleController from '../controllers/module.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public (or Authenticated?) - For now, authenticated users can see available modules
router.get('/', authenticate, moduleController.getModules);

// Org Config
router.get('/config', authenticate, moduleController.getOrgConfig);
router.post('/config', authenticate, moduleController.updateOrgConfig);

export default router;
