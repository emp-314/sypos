const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/salesController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Create sale (cashier/manager/admin)
router.post('/', verifyToken, checkRole(['cashier', 'manager', 'admin']), SalesController.createSale);

// Get all sales
router.get('/', verifyToken, checkRole(['manager', 'admin']), SalesController.getAllSales);

// Get sales by date range
router.get('/date-range', verifyToken, checkRole(['manager', 'admin']), SalesController.getSalesByDateRange);

// Get sales by user
router.get('/user/:userId', verifyToken, checkRole(['manager', 'admin']), SalesController.getSalesByUser);

// Get single sale
router.get('/:id', verifyToken, SalesController.getSaleById);

module.exports = router;
