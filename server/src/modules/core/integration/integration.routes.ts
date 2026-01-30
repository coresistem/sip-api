import { Router } from 'express';
import * as integrationController from './integration.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// Apply authentication to all integration routes
router.use(authenticate);

/**
 * @route POST /api/v1/integration/propose
 * @desc Propose a new integration request
 */
router.post('/propose', integrationController.proposeIntegration);

/**
 * @route POST /api/v1/integration/decision
 * @desc Approve or reject an integration request
 */
router.post('/decision', integrationController.handleIntegrationDecision);

/**
 * @route GET /api/v1/integration/requests
 * @desc List integration requests (sent or received)
 */
router.get('/requests', integrationController.getIntegrationRequests);

export default router;
