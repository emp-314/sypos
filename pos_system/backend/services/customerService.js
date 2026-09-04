const CustomerModel = require('../models/CustomerModel');

class CustomerService {
  // Get all customers
  static async getAllCustomers(limit = 100, offset = 0) {
    try {
      return await CustomerModel.getAllCustomers(limit, offset);
    } catch (error) {
      throw error;
    }
  }

  // Get customer by ID
  static async getCustomerById(customerId) {
    try {
      const customer = await CustomerModel.getCustomerById(customerId);
      if (!customer) {
        throw {
          status: 404,
          message: 'Customer not found'
        };
      }
      return customer;
    } catch (error) {
      throw error;
    }
  }

  // Get customer by phone
  static async getCustomerByPhone(phone) {
    try {
      return await CustomerModel.getCustomerByPhone(phone);
    } catch (error) {
      throw error;
    }
  }

  // Search customers
  static async searchCustomers(query) {
    try {
      if (!query || query.trim().length < 1) {
        throw {
          status: 400,
          message: 'Search query is required'
        };
      }
      return await CustomerModel.searchCustomers(query);
    } catch (error) {
      throw error;
    }
  }

  // Create customer
  static async createCustomer(name, phone, email, address) {
    try {
      if (!name) {
        throw {
          status: 400,
          message: 'Customer name is required'
        };
      }

      return await CustomerModel.createCustomer(name, phone, email, address);
    } catch (error) {
      throw error;
    }
  }

  // Update customer
  static async updateCustomer(customerId, updates) {
    try {
      const customer = await CustomerModel.getCustomerById(customerId);
      if (!customer) {
        throw {
          status: 404,
          message: 'Customer not found'
        };
      }

      return await CustomerModel.updateCustomer(customerId, updates);
    } catch (error) {
      throw error;
    }
  }

  // Delete customer
  static async deleteCustomer(customerId) {
    try {
      const customer = await CustomerModel.getCustomerById(customerId);
      if (!customer) {
        throw {
          status: 404,
          message: 'Customer not found'
        };
      }

      await CustomerModel.deleteCustomer(customerId);
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CustomerService;
