const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { pool } = require('../config/database');

// Get inventory logs by product
router.get('/logs/:productId', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM inventory_logs
       WHERE product_id = ?
       ORDER BY created_at DESC`,
      [req.params.productId]
    );
    res.json({ data: rows, count: rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get low stock products
router.get('/low-stock', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.quantity <= p.reorder_level AND p.status = 'active'
       ORDER BY p.quantity ASC`
    );
    res.json({ data: rows, count: rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual inventory adjustment (admin only)
router.post('/adjust', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { productId, quantityChange, notes } = req.body;

    if (!productId || quantityChange === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity change are required' });
    }

    // Update product quantity
    await pool.query(
      'UPDATE products SET quantity = quantity + ? WHERE product_id = ?',
      [quantityChange, productId]
    );

    // Log the adjustment
    await pool.query(
      `INSERT INTO inventory_logs (product_id, type, quantity_change, notes)
       VALUES (?, ?, ?, ?)`,
      [productId, 'adjustment', quantityChange, notes || 'Manual adjustment']
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE product_id = ?', [productId]);
    res.json({ message: 'Inventory adjusted successfully', data: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all inventory logs (with pagination)
router.get('/', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;

    const [rows] = await pool.query(
      `SELECT il.*, p.name as product_name
       FROM inventory_logs il
       LEFT JOIN products p ON il.product_id = p.product_id
       ORDER BY il.created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ data: rows, count: rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
