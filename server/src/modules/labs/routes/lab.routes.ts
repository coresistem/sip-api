import { Router } from 'express';
import * as LabController from '../controllers/LabController.js';
import { scanIntegrity } from '../controllers/integrity.controller';

const router = Router();

router.get('/public', LabController.getPublicLabs);
router.get('/admin', LabController.getAdminLabs);
router.get('/integrity/scan', scanIntegrity); // New Integrity Bridge
router.post('/', LabController.createLabFeature);
router.patch('/:id', LabController.updateLabStatus);

export default router;
