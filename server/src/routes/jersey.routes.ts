import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as jerseyController from '../controllers/jersey.controller';
import * as orderController from '../controllers/order.controller';
import * as qcController from '../controllers/qc.controller';
import * as jerseyAnalyticsController from '../controllers/jersey.analytics.controller';

const router = Router();

// Helper middleware to check role
const requireRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        next();
    };
};

// ===========================================
// PRODUCT ROUTES
// ===========================================

// Public (authenticated) routes
router.get('/products', authenticate, jerseyController.listProducts);
router.get('/products/:id', authenticate, jerseyController.getProduct);

// Supplier-only routes
router.post('/products', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.createProduct);
router.put('/products/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.updateProduct);
router.delete('/products/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.deleteProduct);

// Variant routes (Supplier only)
router.post('/products/:id/variants', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.addVariant);
router.put('/variants/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.updateVariant);
router.delete('/variants/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.deleteVariant);

// ===========================================
// ORDER ROUTES
// ===========================================

// Calculate order total (anyone authenticated)
router.post('/orders/calculate', authenticate, orderController.calculateOrderTotal);

// Order management
router.get('/orders', authenticate, orderController.listOrders);
router.get('/orders/:id', authenticate, orderController.getOrder);
router.post('/orders', authenticate, orderController.createOrder);

// Status updates (Supplier or Admin)
router.put('/orders/:id/status', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN', 'CLUB']), orderController.updateOrderStatus);

// Cancel order (Customer or Admin)
router.post('/orders/:id/cancel', authenticate, orderController.cancelOrder);

// Payment proof (Customer uploads, Supplier verifies)
router.post('/orders/:id/payment-proof', authenticate, orderController.uploadPaymentProof);
router.post('/orders/:id/verify-payment', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), orderController.verifyPayment);

// ===========================================
// COURIER ROUTES
// ===========================================
// Courier information routes moved to dedicated courier.routes.ts (/api/v1/shipping)
// router.get('/orders/:id/courier', authenticate, qcController.getCourierInfo);
// router.post('/orders/:id/courier', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), qcController.addCourierInfo);
// router.put('/orders/:id/courier', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), qcController.updateCourierInfo);

// ===========================================
// WORKER ROUTES (Supplier Staff)
// ===========================================

router.get('/workers', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.listWorkers);
router.get('/workers/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.getWorker);
router.post('/workers', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.createWorker);
router.put('/workers/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.updateWorker);
router.delete('/workers/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.deleteWorker);

// ===========================================
// TASK ROUTES (Worker Task Assignments)
// ===========================================

router.get('/tasks', authenticate, jerseyController.listTasks);
router.post('/tasks', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.createTask);
router.put('/tasks/:id', authenticate, jerseyController.updateTask);
router.delete('/tasks/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyController.deleteTask);

// ===========================================
// QC (QUALITY CONTROL) ROUTES
// ===========================================

// QC Inspections
router.get('/qc/inspections', authenticate, qcController.listQCInspections);
router.post('/qc/inspections', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER']), qcController.createQCInspection);
router.put('/qc/inspections/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER']), qcController.updateQCInspection);

// QC Rejections
router.get('/qc/rejections', authenticate, qcController.listQCRejections);
router.post('/qc/rejections', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN', 'MANPOWER']), qcController.createQCRejection);

// Repair Requests
router.post('/qc/rejections/:id/repair-request', authenticate, qcController.createRepairRequest);
router.get('/repair-requests', authenticate, qcController.listRepairRequests);
router.put('/repair-requests/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), qcController.updateRepairRequest);
router.put('/repair-requests/:id/complete', authenticate, qcController.completeRepair);

// ===========================================
// ANALYTICS ROUTES
// ===========================================

router.get('/analytics/sales', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyAnalyticsController.getSalesAnalytics);
router.get('/analytics/top-products', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyAnalyticsController.getTopProducts);

// ===========================================
// INVENTORY ROUTES
// ===========================================

router.get('/inventory/alerts', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyAnalyticsController.getInventoryAlerts);

// ===========================================
// CUSTOMER ROUTES
// ===========================================

router.get('/customers', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyAnalyticsController.getCustomerList);
router.get('/customers/:id', authenticate, requireRole(['SUPPLIER', 'SUPER_ADMIN']), jerseyAnalyticsController.getCustomerDetails);

export default router;

