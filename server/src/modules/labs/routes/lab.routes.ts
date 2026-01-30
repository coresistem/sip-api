import { Router } from 'express';
import * as LabController from '../controllers/LabController.js';

const router = Router();

router.get('/public', LabController.getPublicLabs);
router.get('/admin', LabController.getAdminLabs);
router.post('/', LabController.createLabFeature);
router.patch('/:id', LabController.updateLabStatus);

export default router;
