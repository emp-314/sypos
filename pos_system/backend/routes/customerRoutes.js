const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customerController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Get all customers
router.get('/', verifyToken, CustomerController.getAllCustomers);

// Get customer by phone
router.get('/phone/lookup', verifyToken, CustomerController.getCustomerByPhone);

// Search customers
router.get('/search', verifyToken, CustomerController.searchCustomers);

// Get single customer
router.get('/:id', verifyToken, CustomerController.getCustomerById);

// Create customer
router.post('/', verifyToken, CustomerController.createCustomer);

// Update customer
router.put('/:id', verifyToken, CustomerController.updateCustomer);

// Delete customer
router.delete('/:id', verifyToken, CustomerController.deleteCustomer);

module.exports = router;
