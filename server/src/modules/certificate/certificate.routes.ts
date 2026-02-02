import { Router } from 'express';
import { CertificateController } from './certificate.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/auth.middleware'; // Fixed import

const router = Router();

// Public / Authenticated user routes
router.get('/verify/:code', CertificateController.verify);
router.get('/registration/:registrationId/download', authenticate, CertificateController.downloadCertificate);

// EO / Admin Routes
router.get('/competition/:competitionId', authenticate, CertificateController.getCompetitionCertificates);
router.post('/generate-bulk/:competitionId', authenticate, CertificateController.generateBulk);
router.get('/:id', authenticate, CertificateController.getById);
router.delete('/:id', authenticate, CertificateController.delete);

export default router;
