const express = require('express');
const router = express.Router();
const UserModel = require('../models/UserModel');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json({ data: users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (admin only or self)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Allow users to update themselves or admins to update anyone
    if (req.user.userId !== parseInt(req.params.id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updates = req.body;
    const user = await UserModel.updateUser(req.params.id, updates);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    await UserModel.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
