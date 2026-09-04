const SalesModel = require('../models/SalesModel');
const ProductModel = require('../models/ProductModel');
const CustomerModel = require('../models/CustomerModel');
const { pool } = require('../config/database');

class SalesService {
  // Create complete sale with items and payment
  static async createSale(userId, customerId, items, discountAmount = 0, taxAmount = 0, paymentData) {
    try {
      // Start transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Calculate totals
        let totalAmount = 0;

        // Validate and get product details
        const validatedItems = [];
        for (const item of items) {
          const product = await ProductModel.getProductById(item.productId);

          if (!product) {
            throw {
              status: 404,
              message: `Product with ID ${item.productId} not found`
            };
          }

          if (product.quantity < item.quantity) {
            throw {
              status: 400,
              message: `Insufficient stock for product ${product.name}`
            };
          }

          const subtotal = product.price * item.quantity;
          totalAmount += subtotal;
          validatedItems.push({
            ...item,
            unitPrice: product.price,
            subtotal
          });
        }

        const finalAmount = totalAmount - discountAmount + taxAmount;

        // Create sale record
        const saleId = await SalesModel.createSale(
          userId,
          customerId,
          totalAmount,
          discountAmount,
          taxAmount,
          finalAmount,
          paymentData.notes
        );

        // Add sale items and update inventory
        for (const item of validatedItems) {
          await SalesModel.addSaleItem(
            saleId,
            item.productId,
            item.quantity,
            item.unitPrice,
            item.subtotal
          );

          // Update product quantity
          await ProductModel.updateQuantity(item.productId, -item.quantity);

          // Add inventory log
          await connection.query(
            `INSERT INTO inventory_logs (product_id, type, quantity_change, reference_id, notes)
             VALUES (?, ?, ?, ?, ?)`,
            [item.productId, 'sale', -item.quantity, saleId, 'Sale transaction']
          );
        }

        // Create payment record
        // For Paystack (card/mobile_money with email), payment status starts as 'pending' and gets updated after verification
        const isPaystackPayment = (paymentData.method === 'card' || paymentData.method === 'mobile_money') && paymentData.email;
        const paymentStatus = isPaystackPayment ? 'pending' : 'completed';
        const paymentId = await SalesModel.createPayment(
          saleId,
          paymentData.method,
          paymentData.amount,
          paymentData.changeAmount || 0,
          paymentStatus
        );

        // For Paystack, also update sale status to pending (will be completed after payment verification)
        if (isPaystackPayment) {
          await SalesModel.updateSaleStatus(saleId, 'pending');
        }

        // Update customer loyalty points and total purchases
        if (customerId) {
          const loyaltyPoints = Math.floor(finalAmount / 50); // 1 point per GH₵50
          await CustomerModel.addLoyaltyPoints(customerId, loyaltyPoints);
          await CustomerModel.updateTotalPurchases(customerId, finalAmount);
        }

        await connection.commit();

        return {
          saleId,
          paymentId,
          totalAmount,
          discountAmount,
          taxAmount,
          finalAmount,
          itemCount: validatedItems.length
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw error;
    }
  }

  // Get sale by ID
  static async getSaleById(saleId) {
    try {
      const sale = await SalesModel.getSaleById(saleId);
      if (!sale) {
        throw {
          status: 404,
          message: 'Sale not found'
        };
      }
      return sale;
    } catch (error) {
      throw error;
    }
  }

  // Get all sales
  static async getAllSales(limit = 100, offset = 0) {
    try {
      return await SalesModel.getAllSales(limit, offset);
    } catch (error) {
      throw error;
    }
  }

  // Get sales by date range
  static async getSalesByDateRange(startDate, endDate) {
    try {
      return await SalesModel.getSalesByDateRange(startDate, endDate);
    } catch (error) {
      throw error;
    }
  }

  // Get sales by user
  static async getSalesByUser(userId) {
    try {
      return await SalesModel.getSalesByUser(userId);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SalesService;
