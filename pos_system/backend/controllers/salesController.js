const SalesService = require('../services/salesService');
const SalesModel = require('../models/SalesModel');

class SalesController {
  // Create sale
  static async createSale(req, res) {
    try {
      const { customerId, items, discountAmount = 0, taxAmount = 0, paymentData } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required and must not be empty' });
      }

      if (!paymentData || !paymentData.method || !paymentData.amount) {
        return res.status(400).json({ error: 'Payment method and amount are required' });
      }

      // Validate payment method
      const validMethods = ['cash', 'card', 'mobile_money', 'check', 'paystack'];
      if (!validMethods.includes(paymentData.method)) {
        return res.status(400).json({ error: `Invalid payment method. Allowed: ${validMethods.join(', ')}` });
      }

      // For Paystack payments (card/mobile_money with email), require customer email
      const isPaystackPayment = (paymentData.method === 'card' || paymentData.method === 'mobile_money') && paymentData.email;
      if (isPaystackPayment) {
        if (!paymentData.email) {
          return res.status(400).json({ error: 'Email is required for card/mobile money payments' });
        }
        if (paymentData.amount <= 0) {
          return res.status(400).json({ error: 'Amount must be greater than 0 for Paystack payments' });
        }
      }

      const result = await SalesService.createSale(
        req.user.userId,
        customerId,
        items,
        discountAmount,
        taxAmount,
        paymentData
      );

      res.status(201).json({
        message: 'Sale created successfully',
        data: result
      });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get sale by ID
  static async getSaleById(req, res) {
    try {
      const sale = await SalesService.getSaleById(req.params.id);
      res.json(sale);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get all sales
  static async getAllSales(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const sales = await SalesService.getAllSales(limit, offset);
      res.json({ data: sales, count: sales.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get sales by date range
  static async getSalesByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }
      const sales = await SalesService.getSalesByDateRange(startDate, endDate);
      res.json({ data: sales, count: sales.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  // Get sales by user
  static async getSalesByUser(req, res) {
    try {
      const userId = req.params.userId;
      const sales = await SalesService.getSalesByUser(userId);
      res.json({ data: sales, count: sales.length });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = SalesController;
