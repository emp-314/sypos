# Paystack Payment System Documentation

## Overview
This POS system now includes a fully integrated, secure Paystack payment system supporting both online card payments and traditional payment methods (cash, mobile money, check). **Configured for Ghana Cedis (GHS) with full Mobile Money support.**

## Features
✅ **Secure Payment Processing**
- HMAC SHA512 webhook signature verification
- Encrypted API communications (30s timeout)
- Transaction reference tracking and validation

✅ **Currency: Ghana Cedis (GHS)**
- All amounts in Ghana Cedis
- Automatic conversion to pesewas for Paystack API
- Currency symbol (₵) included in all responses

✅ **Multiple Payment Methods**
- Cash (immediate completion)
- Card via Paystack (online payment flow)
- Mobile Money (MTN, Vodafone, AirtelTigo)
- Check

✅ **Reliability Features**
- Automatic retry logic for failed payments
- Webhook-based payment confirmation
- Partial refund support
- Complete transaction audit trail
- Atomic database operations

✅ **Analytics**
- Payment statistics endpoint
- Success/failure rate tracking
- Revenue reporting by payment method

---

## Payment Flow

### Cash Payment (Immediate)
```
1. Customer adds items to cart
2. Cashier creates sale with method='cash'
3. Payment instantly marked as 'completed'
4. Sale status = 'completed'
5. Inventory updated
```

### Paystack Payment (Card/Online)
```
1. Customer adds items to cart
2. Cashier creates sale with method='paystack' + email
3. Sale created with status='pending', payment='pending'
4. Initialize payment endpoint returns authorization_url
5. Customer redirected to Paystack payment page
6. Customer completes payment
7. After success:
   - Webhook confirms with signature verification
   - Payment status → 'completed'
   - Sale status → 'completed'
   - Inventory updated
```

---

## API Endpoints

### 1. Create Sale with Payment

**Endpoint:** `POST /api/sales`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body - Cash Payment:**
```json
{
  "customerId": 1,
  "items": [
    {
      "productId": 5,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ],
  "discountAmount": 5.00,
  "taxAmount": 2.50,
  "paymentData": {
    "method": "cash",
    "amount": 47.50,
    "changeAmount": 2.50,
    "notes": "Counter sale"
  }
}
```

**Request Body - Paystack Payment:**
```json
{
  "customerId": 2,
  "items": [
    {
      "productId": 1,
      "quantity": 1
    }
  ],
  "discountAmount": 0,
  "taxAmount": 0,
  "paymentData": {
    "method": "paystack",
    "amount": 999.99,
    "email": "customer@example.com",
    "notes": "Online order"
  }
}
```

**Response:**
```json
{
  "message": "Sale created successfully",
  "data": {
    "saleId": 42,
    "paymentId": 55,
    "totalAmount": 999.99,
    "discountAmount": 0,
    "taxAmount": 0,
    "finalAmount": 999.99,
    "itemCount": 1
  }
}
```

---

### 2. Initialize Paystack Payment

**Endpoint:** `POST /api/payments/initialize`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Request Body:**
```json
{
  "saleId": 42,
  "amount": 999.99,
  "email": "customer@example.com",
  "customerId": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": 55,
    "authorization_url": "https://checkout.paystack.com/abc123wxyz...",
    "access_code": "abc123wxyz",
    "reference": "PAY-1234567890",
    "amount": 999.99,
    "currency": "GHS",
    "currency_symbol": "₵",
    "message": "Payment initialized. Please complete payment on Paystack."
  }
}
```

**Usage:**
- Redirect customer browser to `authorization_url`
- Customer completes payment on Paystack
- After payment, customer is redirected back to your application
- Call Verify Payment endpoint with returned reference

---

### 3. Verify Payment

**Endpoint:** `POST /api/payments/verify`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "reference": "PAY-1234567890"
}
```

**Response - Success:**
```json
{
  "success": true,
  "data": {
    "payment_id": 55,
    "sale_id": 42,
    "amount": 999.99,
    "currency": "GHS",
    "currency_symbol": "₵",
    "status": "completed",
    "paid_at": "2024-03-25T10:30:45.000Z",
    "reference": "PAY-1234567890",
    "message": "Payment verified and completed successfully"
  }
}
```

**Response - Failed:**
```json
{
  "success": false,
  "error": "Payment verification failed",
  "status": "failed"
}
```

---

### 4. Webhook Handler

**Endpoint:** `POST /api/payments/webhook`
- **No authentication required**
- Paystack sends events here automatically
- Signature verified automatically using`X-Paystack-Signature` header

**Handled Events:**
- `charge.success` - Payment completed, updates payment & sale status
- `charge.failed` - Payment failed, updates payment status

**Note:** All webhook requests return HTTP 200 to acknowledge receipt (even if processing fails).

---

### 5. Refund Payment

**Endpoint:** `POST /api/payments/:id/refund`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Restrictions:**
- Only managers and admins can refund
- Only 'completed' payments can be refunded
- Payment must have Paystack reference

**Request Body - Full Refund:**
```json
{}
```

**Request Body - Partial Refund:**
```json
{
  "amount": 250.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": 55,
    "refund_status": "refunded",
    "refund_amount": 999.99,
    "message": "Refund processed successfully"
  }
}
```

---

### 6. Get Payment Statistics

**Endpoint:** `GET /api/payments/stats/summary?startDate=2024-03-01&endDate=2024-03-31`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "total_transactions": 145,
  "total_amount": "45892.50",
  "average_amount": "316.53",
  "successful_payments": 138,
  "failed_payments": 5,
  "pending_payments": 2
}
```

---

### 7. Get Payments by Sale

**Endpoint:** `GET /api/payments/sale/:saleId`

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response:**
```json
{
  "data": [
    {
      "payment_id": 55,
      "sale_id": 42,
      "method": "paystack",
      "amount": 999.99,
      "paid_amount": 999.99,
      "status": "completed",
      "paystack_reference": "PAY-1234567890",
      "payment_date": "2024-03-25T10:30:45.000Z"
    }
  ],
  "count": 1
}
```

---

## Frontend Implementation Guide

### Step 1: Create Sale with Paystack Method

```javascript
async function startPaystackPayment(cartItems, customerEmail) {
  const response = await fetch('/api/sales', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customerId: customer.id,
      items: cartItems,
      discountAmount: 0,
      taxAmount: 0,
      paymentData: {
        method: 'paystack',
        amount: total,
        email: customerEmail,
        notes: 'POS Sale'
      }
    })
  });

  return response.json(); // Returns { saleId, paymentId, ... }
}
```

### Step 2: Initialize Payment & Redirect

```javascript
async function initializePayment(saleId, amount, email, customerId) {
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      saleId,
      amount,
      email,
      customerId
    })
  });

  const data = response.json();

  // Redirect customer to Paystack checkout
  window.location.href = data.data.authorization_url;
}
```

### Step 3: Handle Redirect Back

After customer completes/cancels payment, customer is redirected back to your app with `?reference=PAY_XXX` query parameter.

```javascript
async function verifyPayment(reference) {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference })
  });

  const data = response.json();

  if (data.success) {
    // Show success message
    console.log('Payment completed:', data.data);
    // Redirect to receipt/dashboard
  } else {
    // Show error message
    console.error('Payment verification failed');
  }
}
```

---

## Security Considerations

### ✅ Implemented Security Measures

1. **Webhook Signature Verification**
   - All webhooks verified using HMAC SHA512
   - Prevents unauthorized webhook spoofing
   - Located in `PaystackService.verifyWebhookSignature()`

2. **API Key Security**
   - Secret key stored in `.env` (never exposed)
   - Public key used only for frontend display
   - Never commit `.env` to version control

3. **Request Validation**
   - All input validated before Paystack API calls
   - Amount validation (must be > 0)
   - Email format validation for Paystack
   - Payment method whitelist validation

4. **Authentication & Authorization**
   - Protected endpoints require JWT token
   - Role-based access (managers/admins only for refunds)
   - Sale ownership verified before processing

5. **Transaction Integrity**
   - Database transactions ensure atomic operations
   - Automatic rollback on errors
   - Inventory properly managed

6. **Rate Limiting** (Recommended)
   - Implement rate limiting on payment endpoints
   - Prevent duplicate payment attempts
   - Use middleware like `express-rate-limit`

---

## Environment Configuration

### Required .env Variables
```
# Paystack API Keys (from Paystack Dashboard)
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_CURRENCY=GHS

# Currency Configuration (Ghana Cedis)
CURRENCY_CODE=GHS
CURRENCY_SYMBOL=₵
CURRENCY_NAME=Ghana Cedis

# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pos_system
```

### Production Checklist
- [ ] Update to live Paystack keys (pk_live_*, sk_live_*)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for production domain
- [ ] Set up proper error logging
- [ ] Enable rate limiting
- [ ] Configure webhook URL in Paystack dashboard
- [ ] Test refund process with live payments
- [ ] Set up automated backups
- [ ] Enable SSL/TLS on production server

---

## Testing Paystack Integration

### Using Paystack Test Cards

**Visa Card (Success):**
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

**Visa Card (Failed):**
- Card: 4222 2222 2222 2220
-Expiry: Any future date
- CVV: Any 3 digits

### Test Payment Flow
1. Create sale with `method: 'paystack'`
2. Initialize payment
3. Use test card details
4. Verify payment returns with reference
5. Check database for payment status = 'completed'
6. Check webhook logs for `charge.success` event

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|------|----------|
| "Email is required for Paystack" | Payment method is paystack but no email provided | Add `email` to `paymentData` |
| "Invalid payment method" | Payment method not in whitelist | Use 'cash', 'card', 'mobile_money', 'check', or 'paystack' |
| "Amount must be greater than 0" | Amount is zero or negative | Ensure total_amount > 0 |
| "Failed to initialize payment" | Paystack API error | Check API keys, network connection, Paystack status |
| "Unauthorized: Invalid signature" | Webhook signature doesn't match | Check secret key, webhook raw body parsing |

---

## Troubleshooting

### Webhook Not Received
1. Check Paystack dashboard webhook configuration
2. Verify public URL is accessible
3. Check server logs for incoming requests
4. Test webhook manually from Paystack dashboard

### Payment Status Not Updating
1. Check database for pending payments
2. Verify webhook was received and processed
3. Check for database connection issues
4. Verify sale_id exists in database

### API Key Issues
1. Regenerate keys in Paystack dashboard
2. Update `.env` file
3. Restart backend server
4. Clear application cache

---

## Support & Resources

- **Paystack Docs:** https://paystack.com/docs
- **API Reference:** https://paystack.com/docs/api
- **Test Dashboard:** https://dashboard.paystack.co

