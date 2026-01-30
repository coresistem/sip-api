import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplace.controller.js';
import { authenticate } from '../../../middleware/auth.middleware.js';

const router = Router();

// Products (Public)
router.get('/products', marketplaceController.listProducts);
router.get('/products/:id', marketplaceController.getProduct);

// Cart (Protected)
router.get('/cart', authenticate, marketplaceController.getCart);
router.post('/cart', authenticate, marketplaceController.addToCart);
router.put('/cart/:itemId', authenticate, marketplaceController.updateCartItem);
router.delete('/cart/:itemId', authenticate, marketplaceController.removeFromCart);

// Orders (Protected)
router.post('/orders', authenticate, marketplaceController.createOrder);
router.get('/orders', authenticate, marketplaceController.listOrders);
router.get('/orders/:id', authenticate, marketplaceController.getOrder);

export default router;
