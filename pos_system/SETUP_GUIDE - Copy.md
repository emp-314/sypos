# Paystack Payment System - Setup & Deployment Guide

## Quick Start

### Prerequisites
- Node.js 14+ with npm/yarn
- MySQL 5.7+
- Paystack account (https://paystack.com)

### 1. Get Paystack API Keys

1. Log in to Paystack Dashboard
2. Go to **Settings** > **API Keys & Webhooks**
3. Copy:
   - **Public Key**: `pk_test_...` (test mode)
   - **Secret Key**: `sk_test_...` (test mode)

### 2. Update Environment Variables

Edit `backend/.env`:
```bash
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

### 3. Run Database Migration

For existing databases, run the migration script:

```bash
# Navigate to your database client
mysql -u root -p pos_system < database/migrations/001_add_paystack_support.sql
```

Or execute these queries manually:
```sql
ALTER TABLE payments ADD COLUMN paid_amount DECIMAL(15, 2) AFTER amount;
ALTER TABLE payments ADD COLUMN paystack_reference VARCHAR(100) AFTER status;
ALTER TABLE payments ADD COLUMN paystack_access_code VARCHAR(100) AFTER paystack_reference;

ALTER TABLE payments MODIFY method ENUM('cash', 'card', 'mobile_money', 'check', 'paystack') NOT NULL;
ALTER TABLE payments MODIFY status ENUM('pending', 'completed', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending';

ALTER TABLE payments ADD INDEX idx_paystack_reference (paystack_reference);

UPDATE payments SET paid_amount = amount WHERE status = 'completed' AND paid_amount IS NULL;
```

### 4. Install Dependencies (if needed)

```bash
cd backend
npm install axios  # Already installed if running existing system
npm start
```

### 5. Configure Webhook in Paystack

1. Go to Paystack Dashboard > **Settings** > **API Keys & Webhooks**
2. Under **Webhooks**, set:
   - **URL**: `https://yourdomain.com/api/payments/webhook`
   - **Events**: Enable `charge.success`, `charge.failed`

3. That's it! Webhook events will now automatically update payment status

---

## Implementation Checklist

### Backend Setup
- [x] Paystack Service created (`backend/services/paystackService.js`)
- [x] Payment Controller created (`backend/controllers/paymentController.js`)
- [x] Payment Routes configured (`backend/routes/paymentRoutes.js`)
- [x] Database Schema updated with Paystack fields
- [x] SalesService updated to support pending payments
- [x] SalesController validation enhanced
- [x] Migration script created for existing databases

### Configuration
- [ ] Paystack API keys added to `.env` file
- [ ] Database migration run on production databases
- [ ] Backend server restarted after `.env` update
- [ ] Webhook URL configured in Paystack dashboard

### Frontend Integration (Your App)
- [ ] Create sale with Paystack method
- [ ] Initialize payment endpoint
- [ ] Redirect to Paystack checkout
- [ ] Handle payment verification after return

### Testing
- [ ] Test cash payment flow
- [ ] Test Paystack payment initialization
- [ ] Test payment verification with test card
- [ ] Test webhook receipt
- [ ] Test refund functionality
- [ ] Check database records for accuracy

### Production Deployment
- [ ] Switch Paystack keys to live (pk_live_*, sk_live_*)
- [ ] Update `NODE_ENV=production`
- [ ] Configure production domain in CORS
- [ ] Set up proper logging/monitoring
- [ ] Enable SSL/TLS
- [ ] Configure production webhook URL
- [ ] Load test payment endpoints
- [ ] Set up automated backups

---

## Database Migration Details

### What Changed
| Field | Type | Purpose |
|-------|------|---------|
| `paid_amount` | DECIMAL(15,2) | Actual amount paid from Paystack |
| `paystack_reference` | VARCHAR(100) | Unique Paystack transaction reference |
| `paystack_access_code` | VARCHAR(100) | Access code for payment URL |
| Method enum | Added 'paystack' | New payment method option |
| Status enum | Added 'partially_refunded' | Partial refund status |

### Migration Safety
- ✅ Non-destructive (no data deleted)
- ✅ Backward compatible (old payments still work)
- ✅ Indexed for performance
- ✅ Automatic data population (paid_amount = amount for existing completed payments)

---

## API Availability

Once configured, these endpoints are available:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/sales` | POST | Create sale with payment method selection |
| `/api/payments/initialize` | POST | Start Paystack payment |
| `/api/payments/verify` | POST | Verify payment after customer return |
| `/api/payments/webhook` | POST | Paystack webhook receiver (auto-called) |
| `/api/payments/:id/refund` | POST | Refund a payment |
| `/api/payments/stats/summary` | GET | Payment statistics |
| `/api/payments/:id` | GET | Get payment details |
| `/api/payments/sale/:saleId` | GET | Get payments for a sale |

---

## Testing with Curl

### 1. Create Sale (Cash)
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [{"productId": 1, "quantity": 1}],
    "discountAmount": 0,
    "taxAmount": 0,
    "paymentData": {
      "method": "cash",
      "amount": 100,
      "changeAmount": 0
    }
  }'
```

### 2. Create Sale (Paystack)
```bash
curl -X POST http://localhost:5000/api/sales \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [{"productId": 1, "quantity": 1}],
    "discountAmount": 0,
    "taxAmount": 0,
    "paymentData": {
      "method": "paystack",
      "amount": 100,
      "email": "customer@example.com"
    }
  }'
```

### 3. Initialize Payment
```bash
curl -X POST http://localhost:5000/api/payments/initialize \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "saleId": 1,
    "amount": 100,
    "email": "customer@example.com",
    "customerId": 1
  }'
```

---

## Monitoring & Logging

### Check Webhook Logs
```javascript
// In PaymentController (line 204)
console.log(`✓ Payment confirmed via webhook - Reference: ${reference}, Amount: ${amount}`);
```

### Monitor Payment Status
```sql
-- Check pending payments
SELECT * FROM payments WHERE status = 'pending';

-- Check today's transactions
SELECT * FROM payments WHERE DATE(payment_date) = DATE(NOW());

-- Count by payment method
SELECT method, COUNT(*) as count, SUM(amount) as total
FROM payments
GROUP BY method;
```

---

## Rollback Plan

If issues occur, you can revert the migration:

```sql
-- Remove Paystack fields (keep data intact)
ALTER TABLE payments DROP COLUMN paid_amount;
ALTER TABLE payments DROP COLUMN paystack_reference;
ALTER TABLE payments DROP COLUMN paystack_access_code;
ALTER TABLE payments DROP INDEX idx_paystack_reference;

-- Revert enums (WARNING: This may fail if paystack/partially_refunded values exist)
-- Better approach: Just continue with current schema
```

---

## Performance Considerations

### Indexes Added
- `idx_paystack_reference` - Fast lookup for webhook processing
- Existing indexes maintained for backward compatibility

### Database Query Times (Expected)
- Initialize payment: ~50ms
- Verify payment: ~30ms
- Process webhook: ~20ms
- Get payment stats: ~100ms (depends on data size)

### Scaling Tips
- [ ] Use read replicas for stats queries
- [ ] Archive old payment records (>1 year) to separate table
- [ ] Enable query caching in MySQL
- [ ] Consider connection pooling (already implemented)

---

## Support Contacts

- **Paystack Support:** support@paystack.com | https://paystack.com/support
- **Backend API Issues:** Check logs in `backend/services/paystackService.js`
- **Database Issues:** Check MySQL error logs

