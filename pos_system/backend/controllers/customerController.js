const CustomerService = require('../services/customerService');

class CustomerController {
  // Get all customers
  static async getAllCustomers(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const customers = await CustomerService.getAllCustomers(limit, offset);
      res.json({ data: customers, count: customers.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get customer by ID
  static async getCustomerById(req, res) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      res.json(customer);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get customer by phone
  static async getCustomerByPhone(req, res) {
    try {
      const phone = req.query.phone;
      if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      const customer = await CustomerService.getCustomerByPhone(phone);
      res.json(customer);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Search customers
  static async searchCustomers(req, res) {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const customers = await CustomerService.searchCustomers(query);
      res.json({ data: customers, count: customers.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Create customer
  static async createCustomer(req, res) {
    try {
      const { name, phone, email, address } = req.body;
      const customer = await CustomerService.createCustomer(name, phone, email, address);
      res.status(201).json({ message: 'Customer created successfully', data: customer });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Update customer
  static async updateCustomer(req, res) {
    try {
      const customer = await CustomerService.updateCustomer(req.params.id, req.body);
      res.json({ message: 'Customer updated successfully', data: customer });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Delete customer
  static async deleteCustomer(req, res) {
    try {
      const result = await CustomerService.deleteCustomer(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = CustomerController;
