const UserModel = require('../models/UserModel');

class AuthService {
  // Login user
  static async login(username, password) {
    try {
      const user = await UserModel.getUserByUsername(username);

      if (!user) {
        throw {
          status: 401,
          message: 'Invalid username or password'
        };
      }

      if (!user.active) {
        throw {
          status: 403,
          message: 'User account is inactive'
        };
      }

      const isPasswordValid = await UserModel.verifyPassword(password, user.password);

      if (!isPasswordValid) {
        throw {
          status: 401,
          message: 'Invalid username or password'
        };
      }

      const token = UserModel.generateToken(user.user_id, user.username, user.role);

      return {
        token,
        user: {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Register new user (admin only)
  static async register(username, email, password, role = 'cashier') {
    try {
      // Check if user already exists
      const existingUser = await UserModel.getUserByUsername(username);
      if (existingUser) {
        throw {
          status: 409,
          message: 'Username already exists'
        };
      }

      const newUser = await UserModel.createUser(username, email, password, role);

      return {
        message: 'User created successfully',
        user: {
          user_id: newUser.user_id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Change password
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await UserModel.getUserById(userId);

      if (!user) {
        throw {
          status: 404,
          message: 'User not found'
        };
      }

      const fullUser = await UserModel.getUserByUsername(user.username);
      const isPasswordValid = await UserModel.verifyPassword(oldPassword, fullUser.password);

      if (!isPasswordValid) {
        throw {
          status: 401,
          message: 'Current password is incorrect'
        };
      }

      await UserModel.updateUser(userId, { password: newPassword });

      return {
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AuthService;
