const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Login
router.post('/login', AuthController.login);

// Register (admin only - for creating new users)
router.post('/register', verifyToken, checkRole(['admin']), AuthController.register);

// Change password (authenticated users)
router.post('/change-password', verifyToken, AuthController.changePassword);

module.exports = router;
