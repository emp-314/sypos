const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jwt-simple');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

class UserModel {
  // Get user by username
  static async getUserByUsername(username) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId) {
    try {
      const [rows] = await pool.query('SELECT user_id, username, email, role, active, created_at FROM users WHERE user_id = ?', [userId]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const [rows] = await pool.query('SELECT user_id, username, email, role, active, created_at FROM users ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Create new user
  static async createUser(username, email, password, role = 'cashier') {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role]
      );
      return this.getUserById(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Generate JWT token
  static generateToken(userId, username, role) {
    const payload = {
      userId,
      username,
      role,
      iat: Math.floor(Date.now() / 1000)
    };
    return jwt.encode(payload, JWT_SECRET);
  }

  // Update user
  static async updateUser(userId, updates) {
    try {
      const allowedFields = ['email', 'role', 'active'];
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (fields.length === 0) return null;

      values.push(userId);
      const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
      await pool.query(query, values);
      return this.getUserById(userId);
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async deleteUser(userId) {
    try {
      await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserModel;
