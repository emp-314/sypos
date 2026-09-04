const PaystackService = require('../services/paystackService');
const { pool } = require('../config/database');

class PaymentController {
  /**
   * Initialize payment for a sale
   * POST /api/payments/initialize
   */
  static async initializePayment(req, res) {
    try {
      const { saleId, amount, email, customerId } = req.body;
      const userId = req.user?.user_id;
      let paymentId = null;

      // Validation
      if (!saleId || !amount || !email) {
        return res.status(400).json({
          error: 'Missing required fields: saleId, amount, email'
        });
      }

      if (amount <= 0) {
        return res.status(400).json({
          error: 'Amount must be greater than 0'
        });
      }

      // Verify sale exists
      const [sale] = await pool.query('SELECT * FROM sales WHERE sale_id = ?', [saleId]);
      if (sale.length === 0) {
        return res.status(404).json({ error: 'Sale not found' });
      }

      // Prepare metadata for Paystack
      const metadata = {
        sale_id: saleId,
        customer_id: customerId || null,
        user_id: userId,
        reference_id: `POSv1_${saleId}_${Date.now()}`
      };

      // Initialize payment with Paystack
      const paymentInitResult = await PaystackService.initializePayment({
        email,
        amount,
        metadata
      });

      if (!paymentInitResult.success) {
        return res.status(400).json({
          error: 'Failed to initialize payment'
        });
      }

      // Check if payment already exists for this sale
      const [existingPayment] = await pool.query(
        'SELECT * FROM payments WHERE sale_id = ?',
        [saleId]
      );

      if (existingPayment.length > 0) {
        // Update existing payment record with Paystack details
        await pool.query(
          `UPDATE payments SET method = ?, amount = ?, status = ?, paystack_reference = ?, paystack_access_code = ?
           WHERE payment_id = ?`,
          ['paystack', amount, 'pending', paymentInitResult.data.reference, paymentInitResult.data.access_code, existingPayment[0].payment_id]
        );
        paymentId = existingPayment[0].payment_id;
      } else {
        // Store pending payment record in database (shouldn't happen as sale creation should create payment)
        const [result] = await pool.query(
          `INSERT INTO payments (sale_id, method, amount, status, paystack_reference, paystack_access_code)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [saleId, 'paystack', amount, 'pending', paymentInitResult.data.reference, paymentInitResult.data.access_code]
        );
        paymentId = result.insertId;
      }

      res.json({
        success: true,
        data: {
          payment_id: paymentId,
          public_key: PaystackService.getPublicKey(),
          authorization_url: paymentInitResult.data.authorization_url,
          access_code: paymentInitResult.data.access_code,
          reference: paymentInitResult.data.reference,
          amount: amount,
          currency: paymentInitResult.data.currency,
          currency_symbol: paymentInitResult.data.currency_symbol,
          message: 'Payment initialized. Please complete payment on Paystack.'
        }
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({
        error: error.message || 'Payment initialization failed'
      });
    }
  }

  /**
   * Verify payment after user completes Paystack transaction
   * POST /api/payments/verify
   */
  static async verifyPayment(req, res) {
    try {
      const { reference } = req.body;

      if (!reference) {
        return res.status(400).json({
          error: 'Payment reference is required'
        });
      }

      // Verify with Paystack
      const verificationResult = await PaystackService.verifyPayment(reference);

      if (!verificationResult.success) {
        return res.status(400).json({
          error: 'Payment verification failed',
          status: verificationResult.data.status
        });
      }

      // Get payment record from database
      const [payments] = await pool.query(
        'SELECT * FROM payments WHERE paystack_reference = ?',
        [reference]
      );

      if (payments.length === 0) {
        return res.status(404).json({
          error: 'Payment record not found'
        });
      }

      const payment = payments[0];
      const saleId = payment.sale_id;

      // Update payment status to completed
      await pool.query(
        `UPDATE payments SET status = ?, paid_amount = ?, payment_date = NOW() WHERE payment_id = ?`,
        ['completed', verificationResult.data.amount, payment.payment_id]
      );

      // Mark sale as paid/completed
      await pool.query(
        'UPDATE sales SET status = ? WHERE sale_id = ?',
        ['completed', saleId]
      );

      // Get updated sale details
      const [updatedSale] = await pool.query(
        'SELECT * FROM sales WHERE sale_id = ?',
        [saleId]
      );

      res.json({
        success: true,
        data: {
          payment_id: payment.payment_id,
          sale_id: saleId,
          amount: verificationResult.data.amount,
          currency: verificationResult.data.currency,
          currency_symbol: verificationResult.data.currency_symbol,
          status: 'completed',
          paid_at: verificationResult.data.paid_at,
          reference: reference,
          message: 'Payment verified and completed successfully'
        }
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        error: error.message || 'Payment verification failed'
      });
    }
  }

  /**
   * Webhook handler for Paystack payment confirmations
   * POST /api/payments/webhook
   */
  static async handleWebhook(req, res) {
    try {
      // Verify webhook signature
      if (!PaystackService.verifyWebhookSignature(req)) {
        console.warn('Invalid Paystack webhook signature');
        return res.status(401).json({
          error: 'Unauthorized: Invalid signature'
        });
      }

      const event = req.body.event;
      const data = req.body.data;

      // Handle charge.success event
      if (event === 'charge.success') {
        const reference = data.reference;
        const amount = data.amount / 100; // Convert from pesewas to Ghana Cedis

        // Get payment record
        const [payments] = await pool.query(
          'SELECT * FROM payments WHERE paystack_reference = ?',
          [reference]
        );

        if (payments.length === 0) {
          console.log(`Payment record not found for reference: ${reference}`);
          return res.sendStatus(200); // Acknowledge webhook
        }

        const payment = payments[0];

        // Update payment status
        await pool.query(
          `UPDATE payments SET status = ?, paid_amount = ?, payment_date = NOW() WHERE payment_id = ?`,
          ['completed', amount, payment.payment_id]
        );

        // Update sale status
        await pool.query(
          'UPDATE sales SET status = ? WHERE sale_id = ?',
          ['completed', payment.sale_id]
        );

        console.log(`✓ Payment confirmed via webhook - Reference: ${reference}, Amount: ${amount}`);
      }

      // Handle charge.failed event
      if (event === 'charge.failed') {
        const reference = data.reference;

        const [payments] = await pool.query(
          'SELECT * FROM payments WHERE paystack_reference = ?',
          [reference]
        );

        if (payments.length > 0) {
          await pool.query(
            'UPDATE payments SET status = ? WHERE payment_id = ?',
            ['failed', payments[0].payment_id]
          );
          console.log(`✗ Payment failed via webhook - Reference: ${reference}`);
        }
      }

      // Always return 200 to acknowledge webhook receipt
      res.sendStatus(200);
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.sendStatus(500);
    }
  }

  /**
   * Get payment details by ID
   * GET /api/payments/:id
   */
  static async getPaymentById(req, res) {
    try {
      const [rows] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      const currencyInfo = PaystackService.getCurrencyInfo();
      res.json({
        ...rows[0],
        currency: currencyInfo.code,
        currency_symbol: currencyInfo.symbol
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get payments by sale ID
   * GET /api/payments/sale/:saleId
   */
  static async getPaymentsBySaleId(req, res) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM payments WHERE sale_id = ? ORDER BY payment_date DESC',
        [req.params.saleId]
      );
      const currencyInfo = PaystackService.getCurrencyInfo();
      res.json({
        data: rows,
        count: rows.length,
        currency: currencyInfo.code,
        currency_symbol: currencyInfo.symbol
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get all payments (admin/manager)
   * GET /api/payments
   */
  static async getAllPayments(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const offset = req.query.offset ? parseInt(req.query.offset) : 0;
      const currencyInfo = PaystackService.getCurrencyInfo();

      const [rows] = await pool.query(
        `SELECT p.*, s.total_amount, s.final_amount, c.name as customer_name
         FROM payments p
         LEFT JOIN sales s ON p.sale_id = s.sale_id
         LEFT JOIN customers c ON s.customer_id = c.customer_id
         ORDER BY p.payment_date DESC LIMIT ? OFFSET ?`,
        [limit, offset]
      );

      res.json({
        data: rows,
        count: rows.length,
        currency: currencyInfo.code,
        currency_symbol: currencyInfo.symbol
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Process refund for a payment
   * POST /api/payments/:id/refund
   */
  static async refundPayment(req, res) {
    try {
      const { amount } = req.body;
      const paymentId = req.params.id;

      const [payments] = await pool.query('SELECT * FROM payments WHERE payment_id = ?', [paymentId]);
      if (payments.length === 0) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const payment = payments[0];

      if (!payment.paystack_reference) {
        return res.status(400).json({
          error: 'Cannot refund payment without Paystack reference'
        });
      }

      if (payment.status !== 'completed') {
        return res.status(400).json({
          error: 'Only completed payments can be refunded'
        });
      }

      // Process refund with Paystack
      const refundResult = await PaystackService.refundTransaction(
        payment.paystack_reference,
        amount || payment.paid_amount
      );

      // Update payment status
      const newStatus = amount && amount < payment.paid_amount ? 'partially_refunded' : 'refunded';
      await pool.query(
        'UPDATE payments SET status = ? WHERE payment_id = ?',
        [newStatus, paymentId]
      );

      const currencyInfo = PaystackService.getCurrencyInfo();

      res.json({
        success: true,
        data: {
          payment_id: paymentId,
          refund_status: newStatus,
          refund_amount: amount || payment.paid_amount,
          currency: currencyInfo.code,
          currency_symbol: currencyInfo.symbol,
          message: 'Refund processed successfully'
        }
      });
    } catch (error) {
      console.error('Refund error:', error);
      res.status(500).json({
        error: error.message || 'Refund processing failed'
      });
    }
  }

  /**
   * Get payment statistics
   * GET /api/payments/stats/summary
   */
  static async getPaymentStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const currencyInfo = PaystackService.getCurrencyInfo();

      let query = `SELECT
        COUNT(*) as total_transactions,
        SUM(paid_amount) as total_amount,
        AVG(paid_amount) as average_amount,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_payments,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments
      FROM payments WHERE 1=1`;

      const params = [];

      if (startDate && endDate) {
        query += ' AND DATE(payment_date) BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      const [stats] = await pool.query(query, params);

      res.json({
        ...stats[0],
        currency: currencyInfo.code,
        currency_symbol: currencyInfo.symbol,
        currency_name: currencyInfo.name
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PaymentController;
