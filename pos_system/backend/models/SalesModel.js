const { pool } = require('../config/database');

class SalesModel {
  // Get all sales
  static async getAllSales(limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(
        `SELECT s.*, u.username, c.name as customer_name
         FROM sales s
         LEFT JOIN users u ON s.user_id = u.user_id
         LEFT JOIN customers c ON s.customer_id = c.customer_id
         WHERE s.status = 'completed'
         ORDER BY s.sale_date DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get sale by ID with items
  static async getSaleById(saleId) {
    try {
      const [sale] = await pool.query(
        `SELECT s.*, u.username, c.name as customer_name
         FROM sales s
         LEFT JOIN users u ON s.user_id = u.user_id
         LEFT JOIN customers c ON s.customer_id = c.customer_id
         WHERE s.sale_id = ?`,
        [saleId]
      );

      if (!sale || sale.length === 0) return null;

      const [items] = await pool.query(
        `SELECT si.*, p.name as product_name
         FROM sales_items si
         LEFT JOIN products p ON si.product_id = p.product_id
         WHERE si.sale_id = ?`,
        [saleId]
      );

      const [payment] = await pool.query(
        'SELECT * FROM payments WHERE sale_id = ?',
        [saleId]
      );

      return {
        ...sale[0],
        items,
        payment: payment[0] || null
      };
    } catch (error) {
      throw error;
    }
  }

  // Get sales by date range
  static async getSalesByDateRange(startDate, endDate) {
    try {
      const [rows] = await pool.query(
        `SELECT s.*, u.username, c.name as customer_name
         FROM sales s
         LEFT JOIN users u ON s.user_id = u.user_id
         LEFT JOIN customers c ON s.customer_id = c.customer_id
         WHERE DATE(s.sale_date) BETWEEN ? AND ? AND s.status = 'completed'
         ORDER BY s.sale_date DESC`,
        [startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create sale
  static async createSale(userId, customerId, totalAmount, discountAmount, taxAmount, finalAmount, notes) {
    try {
      const [result] = await pool.query(
        `INSERT INTO sales (user_id, customer_id, total_amount, discount_amount, tax_amount, final_amount, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, customerId || null, totalAmount, discountAmount, taxAmount, finalAmount, notes]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Add sale item
  static async addSaleItem(saleId, productId, quantity, unitPrice, subtotal) {
    try {
      const [result] = await pool.query(
        `INSERT INTO sales_items (sale_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [saleId, productId, quantity, unitPrice, subtotal]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Create payment
  static async createPayment(saleId, method, amount, changeAmount, status = 'completed') {
    try {
      const [result] = await pool.query(
        `INSERT INTO payments (sale_id, method, amount, change_amount, status)
         VALUES (?, ?, ?, ?, ?)`,
        [saleId, method, amount, changeAmount || 0, status]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update sale status
  static async updateSaleStatus(saleId, status) {
    try {
      await pool.query('UPDATE sales SET status = ? WHERE sale_id = ?', [status, saleId]);
    } catch (error) {
      throw error;
    }
  }

  // Get sale count
  static async getSaleCount(startDate, endDate) {
    try {
      const [result] = await pool.query(
        `SELECT COUNT(*) as count FROM sales
         WHERE status = 'completed' AND DATE(sale_date) BETWEEN ? AND ?`,
        [startDate, endDate]
      );
      return result[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Get total revenue
  static async getTotalRevenue(startDate, endDate) {
    try {
      const [result] = await pool.query(
        `SELECT SUM(final_amount) as total FROM sales
         WHERE status = 'completed' AND DATE(sale_date) BETWEEN ? AND ?`,
        [startDate, endDate]
      );
      return result[0].total || 0;
    } catch (error) {
      throw error;
    }
  }

  // Get sales by user
  static async getSalesByUser(userId) {
    try {
      const [rows] = await pool.query(
        `SELECT s.*, c.name as customer_name
         FROM sales s
         LEFT JOIN customers c ON s.customer_id = c.customer_id
         WHERE s.user_id = ? AND s.status = 'completed'
         ORDER BY s.sale_date DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SalesModel;
