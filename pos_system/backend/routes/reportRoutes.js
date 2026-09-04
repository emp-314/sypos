const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const { pool } = require('../config/database');
const SalesModel = require('../models/SalesModel');

// Get daily revenue
router.get('/daily/:date', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const date = req.params.date;
    const [sales] = await pool.query(
      `SELECT COUNT(*) as sale_count, SUM(final_amount) as total_revenue
       FROM sales
       WHERE DATE(sale_date) = ? AND status = 'completed'`,
      [date]
    );

    const [topProducts] = await pool.query(
      `SELECT p.product_id, p.name, SUM(si.quantity) as quantity_sold, SUM(si.subtotal) as total
       FROM sales s
       JOIN sales_items si ON s.sale_id = si.sale_id
       JOIN products p ON si.product_id = p.product_id
       WHERE DATE(s.sale_date) = ? AND s.status = 'completed'
       GROUP BY p.product_id
       ORDER BY quantity_sold DESC LIMIT 10`,
      [date]
    );

    res.json({
      date,
      sales: sales[0] || { sale_count: 0, total_revenue: 0 },
      topProducts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue by date range
router.get('/revenue/range', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const [report] = await pool.query(
      `SELECT DATE(sale_date) as date,
              COUNT(*) as sales_count,
              SUM(final_amount) as total_revenue,
              SUM(discount_amount) as total_discount,
              SUM(tax_amount) as total_tax
       FROM sales
       WHERE DATE(sale_date) BETWEEN ? AND ? AND status = 'completed'
       GROUP BY DATE(sale_date)
       ORDER BY date DESC`,
      [startDate, endDate]
    );

    res.json({ data: report, count: report.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top products
router.get('/products/top', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const startDate = req.query.startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];

    const [products] = await pool.query(
      `SELECT p.product_id, p.name, SUM(si.quantity) as quantity_sold,
              SUM(si.subtotal) as total_revenue, COUNT(si.sale_id) as times_sold
       FROM sales s
       JOIN sales_items si ON s.sale_id = si.sale_id
       JOIN products p ON si.product_id = p.product_id
       WHERE DATE(s.sale_date) BETWEEN ? AND ? AND s.status = 'completed'
       GROUP BY p.product_id
       ORDER BY quantity_sold DESC LIMIT 20`,
      [startDate, endDate]
    );

    res.json({ data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales summary
router.get('/summary', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [todayStats] = await pool.query(
      `SELECT COUNT(*) as sales, SUM(final_amount) as revenue
       FROM sales
       WHERE DATE(sale_date) = ? AND status = 'completed'`,
      [today]
    );

    const [monthStats] = await pool.query(
      `SELECT COUNT(*) as sales, SUM(final_amount) as revenue
       FROM sales
       WHERE MONTH(sale_date) = MONTH(NOW()) AND YEAR(sale_date) = YEAR(NOW())
       AND status = 'completed'`
    );

    const [allTimeStats] = await pool.query(
      `SELECT COUNT(*) as sales, SUM(final_amount) as revenue FROM sales WHERE status = 'completed'`
    );

    const [topEmployee] = await pool.query(
      `SELECT u.username, COUNT(s.sale_id) as sales_count, SUM(s.final_amount) as total_revenue
       FROM sales s
       JOIN users u ON s.user_id = u.user_id
       WHERE DATE(s.sale_date) = ? AND s.status = 'completed'
       GROUP BY u.user_id
       ORDER BY sales_count DESC LIMIT 1`,
      [today]
    );

    res.json({
      today: todayStats[0] || { sales: 0, revenue: 0 },
      thisMonth: monthStats[0] || { sales: 0, revenue: 0 },
      allTime: allTimeStats[0] || { sales: 0, revenue: 0 },
      topEmployee: topEmployee[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment methods summary
router.get('/payments/methods', verifyToken, checkRole(['manager', 'admin']), async (req, res) => {
  try {
    const startDate = req.query.startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
    const endDate = req.query.endDate || new Date().toISOString().split('T')[0];

    const [methods] = await pool.query(
      `SELECT method, COUNT(*) as count, SUM(amount) as total
       FROM payments
       WHERE DATE(payment_date) BETWEEN ? AND ? AND status = 'completed'
       GROUP BY method`,
      [startDate, endDate]
    );

    res.json({ data: methods, count: methods.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
