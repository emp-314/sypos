const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const PaymentController = require('../controllers/paymentController');

// =========================
// Paystack Payment Routes
// =========================

// Initialize payment
router.post('/initialize', verifyToken, PaymentController.initializePayment);

// Verify payment
router.post('/verify', PaymentController.verifyPayment);

// Webhook for Paystack (no auth required)
router.post('/webhook', PaymentController.handleWebhook);

// Refund payment
router.post('/:id/refund', verifyToken, checkRole(['manager', 'admin']), PaymentController.refundPayment);

// =========================
// Payment Query Routes
// =========================

// Get payment statistics
router.get('/stats/summary', verifyToken, checkRole(['manager', 'admin']), PaymentController.getPaymentStats);

// Get payment by ID
router.get('/:id', verifyToken, PaymentController.getPaymentById);

// Get payments by sale ID
router.get('/sale/:saleId', verifyToken, PaymentController.getPaymentsBySaleId);

// Get all payments (admin/manager)
router.get('/', verifyToken, checkRole(['manager', 'admin']), PaymentController.getAllPayments);

module.exports = router;
