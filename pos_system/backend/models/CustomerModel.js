const { pool } = require('../config/database');

class CustomerModel {
  // Get all customers
  static async getAllCustomers(limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM customers
         WHERE status = 'active'
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get customer by ID
  static async getCustomerById(customerId) {
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE customer_id = ?', [customerId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get customer by phone
  static async getCustomerByPhone(phone) {
    try {
      const [rows] = await pool.query('SELECT * FROM customers WHERE phone = ?', [phone]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Search customers by name or phone
  static async searchCustomers(query) {
    try {
      const searchQuery = `%${query}%`;
      const [rows] = await pool.query(
        `SELECT * FROM customers
         WHERE (name LIKE ? OR phone LIKE ? OR email LIKE ?) AND status = 'active'
         ORDER BY name`,
        [searchQuery, searchQuery, searchQuery]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create customer
  static async createCustomer(name, phone, email, address) {
    try {
      const [result] = await pool.query(
        `INSERT INTO customers (name, phone, email, address)
         VALUES (?, ?, ?, ?)`,
        [name, phone, email, address]
      );
      return this.getCustomerById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Update customer
  static async updateCustomer(customerId, updates) {
    try {
      const allowedFields = ['name', 'phone', 'email', 'address', 'loyalty_points', 'status'];
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) return null;

      values.push(customerId);
      const query = `UPDATE customers SET ${fields.join(', ')} WHERE customer_id = ?`;
      await pool.query(query, values);
      return this.getCustomerById(customerId);
    } catch (error) {
      throw error;
    }
  }

  // Delete customer (soft delete)
  static async deleteCustomer(customerId) {
    try {
      await pool.query('UPDATE customers SET status = ? WHERE customer_id = ?', ['inactive', customerId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Add loyalty points
  static async addLoyaltyPoints(customerId, points) {
    try {
      await pool.query(
        'UPDATE customers SET loyalty_points = loyalty_points + ? WHERE customer_id = ?',
        [points, customerId]
      );
      return this.getCustomerById(customerId);
    } catch (error) {
      throw error;
    }
  }

  // Update total purchases
  static async updateTotalPurchases(customerId, amount) {
    try {
      await pool.query(
        'UPDATE customers SET total_purchases = total_purchases + ? WHERE customer_id = ?',
        [amount, customerId]
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CustomerModel;
