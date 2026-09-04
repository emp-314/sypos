const { pool } = require('../config/database');

class ProductModel {
  // Get all products
  static async getAllProducts(limit = 100, offset = 0) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE p.status = 'active'
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get product by ID
  static async getProductById(productId) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE p.product_id = ?`,
        [productId]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get product by barcode
  static async getProductByBarcode(barcode) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE p.barcode = ?`,
        [barcode]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Search products by name or barcode
  static async searchProducts(query) {
    try {
      const searchQuery = `%${query}%`;
      const [rows] = await pool.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE (p.name LIKE ? OR p.barcode LIKE ?) AND p.status = 'active'
         ORDER BY p.name`,
        [searchQuery, searchQuery]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get products by category
  static async getProductsByCategory(categoryId) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE p.category_id = ? AND p.status = 'active'`,
        [categoryId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create product
  static async createProduct(name, category_id, barcode, price, quantity, reorder_level, image_url) {
    try {
      const [result] = await pool.query(
        `INSERT INTO products (name, category_id, barcode, price, quantity, reorder_level, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, category_id, barcode, price, quantity, reorder_level, image_url || null]
      );
      return this.getProductById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Update product
  static async updateProduct(productId, updates) {
    try {
      const allowedFields = ['name', 'category_id', 'barcode', 'price', 'quantity', 'reorder_level', 'status', 'image_url'];
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key) && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) return null;

      values.push(productId);
      const query = `UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`;
      await pool.query(query, values);
      return this.getProductById(productId);
    } catch (error) {
      throw error;
    }
  }

  // Delete product (soft delete)
  static async deleteProduct(productId) {
    try {
      await pool.query('UPDATE products SET status = ? WHERE product_id = ?', ['inactive', productId]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Update product quantity
  static async updateQuantity(productId, quantityChange) {
    try {
      await pool.query(
        'UPDATE products SET quantity = quantity + ? WHERE product_id = ?',
        [quantityChange, productId]
      );
      return this.getProductById(productId);
    } catch (error) {
      throw error;
    }
  }

  // Get low stock products
  static async getLowStockProducts() {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.category_id
         WHERE p.quantity <= p.reorder_level AND p.status = 'active'`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductModel;
