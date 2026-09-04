const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_4e9455f5c10d035989ed3674207c6de54fc77bb2';
const PAYSTACK_CURRENCY = process.env.PAYSTACK_CURRENCY || 'GHS'; // Ghana Cedis
const CURRENCY_CODE = process.env.CURRENCY_CODE || 'GHS';
const CURRENCY_SYMBOL = process.env.CURRENCY_SYMBOL || '₵';

// Create axios instance with Paystack credentials
const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

class PaystackService {
  /**
   * Initialize a payment transaction
   * @param {Object} paymentData - Payment details { email, amount, metadata }
   * @returns {Promise<Object>} - Paystack response with authorization_url
   */
  static async initializePayment(paymentData) {
    try {
      const { email, amount, metadata = {} } = paymentData;

      if (!email || !amount) {
        throw new Error('Email and amount are required');
      }

      // Amount must be in pesewas (Ghana Cedis sub-unit: 1 GHS = 100 pesewas)
      const amountInPesewas = Math.round(amount * 100);

      const payload = {
        email,
        amount: amountInPesewas,
        currency: PAYSTACK_CURRENCY,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          currency: CURRENCY_CODE
        }
      };

      const response = await paystackClient.post('/transaction/initialize', payload);
      console.log('Paystack initialization response:', response.data);
      return {
        success: true,
        data: {
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
          reference: response.data.data.reference,
          currency: CURRENCY_CODE,
          currency_symbol: CURRENCY_SYMBOL
        }
      };
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(`Payment initialization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verify a payment transaction
   * @param {string} reference - Paystack transaction reference
   * @returns {Promise<Object>} - Verification result with status
   */
  static async verifyPayment(reference) {
    try {
      if (!reference) {
        throw new Error('Reference is required');
      }

      const response = await paystackClient.get(`/transaction/verify/${reference}`);
      const transaction = response.data.data;
      console.log('Paystack verification response:', transaction);

      return {
        success: transaction.status === 'success',
        data: {
          reference: transaction.reference,
          status: transaction.status,
          amount: transaction.amount / 100, // Convert from pesewas to Ghana Cedis
          currency: CURRENCY_CODE,
          currency_symbol: CURRENCY_SYMBOL,
          email: transaction.customer.email,
          paid_at: transaction.paid_at,
          authorization: transaction.authorization,
          customer: transaction.customer
        }
      };
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(`Payment verification failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Verify webhook signature from Paystack
   * @param {Object} req - Express request object
   * @returns {boolean} - True if signature is valid
   */
  static verifyWebhookSignature(req) {
    try {
      const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(req.body))
        .digest('hex');

      const signature = req.headers['x-paystack-signature'];
      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error.message);
      return false;
    }
  }

  /**
   * Get transaction details
   * @param {string} reference - Paystack transaction reference
   * @returns {Promise<Object>} - Transaction details
   */
  static async getTransactionDetails(reference) {
    try {
      const response = await paystackClient.get(`/transaction/${reference}`);
      const transaction = response.data.data;
      // Add currency info to response
      transaction.currency = CURRENCY_CODE;
      transaction.currency_symbol = CURRENCY_SYMBOL;
      transaction.amount_in_currency = transaction.amount / 100;
      return transaction;
    } catch (error) {
      console.error('Paystack get transaction error:', error.response?.data || error.message);
      throw new Error(`Failed to get transaction details: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get all transactions for an email
   * @param {string} email - Customer email
   * @returns {Promise<Array>} - List of transactions
   */
  static async getCustomerTransactions(email) {
    try {
      const response = await paystackClient.get('/transaction', {
        params: { customer: email }
      });
      const transactions = response.data.data || [];
      // Add currency info to each transaction
      return transactions.map(t => ({
        ...t,
        currency: CURRENCY_CODE,
        currency_symbol: CURRENCY_SYMBOL,
        amount_in_currency: t.amount / 100
      }));
    } catch (error) {
      console.error('Paystack get customer transactions error:', error.response?.data || error.message);
      throw new Error(`Failed to get customer transactions: ${error.message}`);
    }
  }

  /**
   * Create a customer record on Paystack
   * @param {Object} customerData - { email, first_name, last_name, phone }
   * @returns {Promise<Object>} - Customer details
   */
  static async createCustomer(customerData) {
    try {
      const response = await paystackClient.post('/customer', customerData);
      return response.data.data;
    } catch (error) {
      console.error('Paystack create customer error:', error.response?.data || error.message);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Process refund for a transaction
   * @param {string} reference - Paystack transaction reference
   * @param {number} amount - Amount to refund in Ghana Cedis (optional, full refund if not provided)
   * @returns {Promise<Object>} - Refund details
   */
  static async refundTransaction(reference, amount = null) {
    try {
      const payload = {
        transaction: reference
      };

      if (amount) {
        payload.amount = Math.round(amount * 100); // Convert Ghana Cedis to pesewas
      }

      const response = await paystackClient.post('/refund', payload);
      const refund = response.data.data;
      // Add currency info
      refund.currency = CURRENCY_CODE;
      refund.currency_symbol = CURRENCY_SYMBOL;
      if (refund.amount) {
        refund.amount_in_currency = refund.amount / 100;
      }
      return refund;
    } catch (error) {
      console.error('Paystack refund error:', error.response?.data || error.message);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Get currency information
   * @returns {Object} - Currency details
   */
  static getCurrencyInfo() {
    return {
      code: CURRENCY_CODE,
      symbol: CURRENCY_SYMBOL,
      name: process.env.CURRENCY_NAME || 'Ghana Cedis',
      paystack_currency: PAYSTACK_CURRENCY,
      sub_unit: 'Pesewas',
      sub_unit_per_main: 100
    };
  }

  /**
   * Get Paystack public key (safe to expose to frontend)
   * @returns {string} - Public key
   */
  static getPublicKey() {
    return PAYSTACK_PUBLIC_KEY;
  }
}

module.exports = PaystackService;
