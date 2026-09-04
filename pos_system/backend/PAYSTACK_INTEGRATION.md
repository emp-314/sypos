# Paystack Payment System Integration

This document explains how to use the Paystack payment system integrated into your POS system.

## Setup

### 1. Environment Variables
Ensure these variables are set in your `.env` file:
```
PAYSTACK_PUBLIC_KEY=pk_test_4e9455f5c10d035989ed3674207c6de54fc77bb2
PAYSTACK_SECRET_KEY=sk_test_8a8472d5ce29b29724e8dc51041a5260c9255116
```

### 2. Database Migration
Run the migration to add Paystack fields to the payments table:
```bash
mysql -u root -p pos_system < backend/migrations/add_paystack_fields.sql
```

### 3. Configure Webhook
In your Paystack dashboard:
1. Go to Settings → API Keys & Webhooks
2. Add webhook URL: `https://yourapp.com/api/payments/webhook`
3. Copy your keys to the `.env` file

## API Endpoints

### 1. Initialize Payment
**Endpoint:** `POST /api/payments/initialize`

**Authentication:** Required (verifyToken)

**Request Body:**
```json
{
  "saleId": 1,
  "amount": 25000,
  "email": "customer@example.com",
  "customerId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": 5,
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "code_...",
    "reference": "ref_...",
    "amount": 25000,
    "message": "Payment initialized. Please complete payment on Paystack."
  }
}
```

**Usage:**
- Call this endpoint when customer initiates payment
- Redirect customer to `authorization_url`
- Store `reference` for verification

### 2. Verify Payment
**Endpoint:** `POST /api/payments/verify`

**Authentication:** Not required (can be called from frontend)

**Request Body:**
```json
{
  "reference": "ref_1234567890"
}
```

**Response on Success:**
```json
{
  "success": true,
  "data": {
    "payment_id": 5,
    "sale_id": 1,
    "amount": 25000,
    "status": "completed",
    "paid_at": "2024-03-25T10:30:00.000Z",
    "reference": "ref_1234567890",
    "message": "Payment verified and completed successfully"
  }
}
```

**Usage:**
- Call this after customer completes payment on Paystack
- Paystack redirects back to your app with reference in URL query
- Call this endpoint to confirm payment

### 3. Webhook Handler
**Endpoint:** `POST /api/payments/webhook`

**No authentication required** (Paystack verifies with signature)

Paystack sends webhook events:
- `charge.success` - Payment completed successfully
- `charge.failed` - Payment failed

The system automatically:
- Verifies webhook signature using `PAYSTACK_SECRET_KEY`
- Updates payment status in database
- Marks sale as completed

### 4. Get Payment Details
**Endpoint:** `GET /api/payments/:id`

**Authentication:** Required

**Response:**
```json
{
  "payment_id": 5,
  "sale_id": 1,
  "method": "paystack",
  "amount": 25000,
  "status": "completed",
  "paystack_reference": "ref_1234567890",
  "paid_amount": 25000,
  "payment_date": "2024-03-25T10:30:00.000Z"
}
```

### 5. Get Payments by Sale
**Endpoint:** `GET /api/payments/sale/:saleId`

**Authentication:** Required

**Query Parameters:**
- None

### 6. Get All Payments
**Endpoint:** `GET /api/payments`

**Authentication:** Required (manager/admin only)

**Query Parameters:**
- `limit` (default: 100)
- `offset` (default: 0)

### 7. Refund Payment
**Endpoint:** `POST /api/payments/:id/refund`

**Authentication:** Required (manager/admin only)

**Request Body:**
```json
{
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": 5,
    "refund_status": "refunded",
    "refund_amount": 25000,
    "message": "Refund processed successfully"
  }
}
```

### 8. Get Payment Statistics
**Endpoint:** `GET /api/payments/stats/summary`

**Authentication:** Required (manager/admin only)

**Query Parameters:**
- `startDate` (optional, format: YYYY-MM-DD)
- `endDate` (optional, format: YYYY-MM-DD)

**Response:**
```json
{
  "total_transactions": 150,
  "total_amount": 7500000,
  "average_amount": 50000,
  "successful_payments": 148,
  "failed_payments": 2,
  "pending_payments": 0
}
```

## Frontend Implementation

### Payment Flow

```javascript
// Step 1: Initialize payment
async function initializePayment(saleId, amount, email) {
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      saleId,
      amount,
      email,
      customerId: customerInfo.id
    })
  });

  const result = await response.json();

  // Step 2: Redirect to Paystack
  if (result.success) {
    window.location.href = result.data.authorization_url;
  }
}

// Step 3: Handle redirect back (Paystack redirects to your success page with reference)
async function handlePaymentReturn(reference) {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reference })
  });

  const result = await response.json();

  if (result.success) {
    // Show success message
    console.log('Payment successful:', result.data);
    // Redirect to receipt or home page
  } else {
    // Show error
    console.error('Payment verification failed');
  }
}
```

## Security Considerations

1. **Webhook Signature Verification**: The system automatically verifies Paystack webhook signatures using the secret key
2. **Token Authentication**: Payment initialization requires valid JWT token
3. **HTTPS Only**: Always use HTTPS in production
4. **Amount Validation**: Amounts are validated before processing
5. **Database Transaction Safety**: All payment updates are atomic
6. **Sensitive Data**: API keys are stored in `.env` and never exposed
7. **Refund Authorization**: Only managers/admins can process refunds

## Error Handling

Common error responses:

```json
{
  "error": "Missing required fields: saleId, amount, email"
}
```

```json
{
  "error": "Payment verification failed",
  "status": "abandoned"
}
```

## Testing

### Test Credentials
Use Paystack's test credentials:
- **Public Key:** `pk_test_4e9455f5c10d035989ed3674207c6de54fc77bb2`
- **Secret Key:** `sk_test_8a8472d5ce29b29724e8dc51041a5260c9255116`

### Test Cards
- **Visa (Success):** 4084 0343 8371 8870 | 12/25 | 812 | CVV: any
- **Visa (Failed):** 4111 1111 1111 1111 | 12/25 | 812 | CVV: any

## Troubleshooting

### Payment initialization fails
- Check if `PAYSTACK_SECRET_KEY` is correct in `.env`
- Verify network connection to `https://api.paystack.co`
- Check if amount is > 0

### Webhook not received
- Verify webhook URL in Paystack dashboard
- Check server logs for webhook events
- Ensure webhook URL is publicly accessible

### Payment verification fails
- Confirm reference is correct
- Check if payment exists in Paystack system
- Verify internet connection

## Production Checklist

- [ ] Switch to live keys from Paystack
- [ ] Update `.env` with production keys
- [ ] Configure webhook URL to production domain
- [ ] Enable HTTPS
- [ ] Test refund functionality
- [ ] Monitor webhook failed events
- [ ] Set up alerts for payment failures
- [ ] Document customer support process for failed payments
