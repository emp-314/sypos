# Ghana Cedis (GHS) Payment Configuration

## Overview
Your Paystack payment system is now configured for Ghana Cedis (GHS) with support for Paystack Mobile Money payments common in Ghana.

## Currency Configuration

### Environment Variables
```env
# Currency Settings
CURRENCY_CODE=GHS              # ISO 4217 code for Ghana Cedis
CURRENCY_SYMBOL=₵              # Ghana Cedis symbol
CURRENCY_NAME=Ghana Cedis      # Full currency name

# Paystack Ghana Configuration
PAYSTACK_CURRENCY=GHS          # Currency for Paystack API
PAYSTACK_PUBLIC_KEY=pk_test_4e9455f5c10d035989ed3674207c6de54fc77bb2
PAYSTACK_SECRET_KEY=sk_test_8a8472d5ce29b29724e8dc51041a5260c9255116
```

## Amount Handling

### Currency Units
- **Main Unit**: Ghana Cedis (GHS) - What customers see
- **Sub-unit**: Pesewas - 1 GHS = 100 pesewas
- **Conversion**: Automatically handled by PaystackService (GHS × 100 = pesewas)

### Example
```
Customer pays: 50.00 GHS
Stored in DB as: 50.00
Sent to Paystack as: 5000 pesewas
Webhook receives: 5000 pesewas
Converted back to: 50.00 GHS
```

## Paystack Mobile Money Support

### Supported Mobile Money Networks (Ghana)
✅ **MTN Mobile Money** - Largest network in Ghana
✅ **Vodafone Cash** - Second largest network
✅ **AirtelTigo Money** - Third network
✅ **Card Payments** - Visa/Mastercard
✅ **Bank Transfers** - Direct bank payments

### Payment Flow for Mobile Money

1. **Customer initiates payment**
   ```json
   POST /api/sales
   {
     "customerId": 1,
     "items": [...],
     "paymentData": {
       "method": "paystack",
       "amount": 50.00,
       "email": "customer@example.com"
     }
   }
   ```

2. **Get Paystack checkout link**
   ```json
   POST /api/payments/initialize
   {
     "saleId": 42,
     "amount": 50.00,
     "email": "customer@example.com",
     "customerId": 1
   }
   ```

3. **Response includes checkout URL**
   ```json
   {
     "success": true,
     "data": {
       "authorization_url": "https://checkout.paystack.com/...",
       "reference": "PAY-1234567890",
       "amount": 50.00,
       "currency": "GHS",
       "currency_symbol": "₵"
     }
   }
   ```

4. **Customer selects Mobile Money provider**
   - Paystack checkout page shows all available networks
   - Customer selects MTN, Vodafone, etc.
   - Enters phone number
   - Confirms payment

5. **Webhook confirmation**
   - Paystack sends webhook: `charge.success`
   - Amount is automatically converted from pesewas to GHS
   - Payment status Updated to "completed"
   - Sale status updated to "completed"

## API Responses - Now with Currency

### Initialize Payment Response
```json
{
  "success": true,
  "data": {
    "payment_id": 55,
    "authorization_url": "https://checkout.paystack.com/abc123...",
    "reference": "PAY-1234567890",
    "amount": 50.00,
    "currency": "GHS",
    "currency_symbol": "₵",
    "message": "Payment initialized. Please complete payment on Paystack."
  }
}
```

### Payment Verification Response
```json
{
  "success": true,
  "data": {
    "payment_id": 55,
    "sale_id": 42,
    "amount": 50.00,
    "currency": "GHS",
    "currency_symbol": "₵",
    "status": "completed",
    "paid_at": "2024-03-25T10:30:45.000Z",
    "reference": "PAY-1234567890",
    "message": "Payment verified and completed successfully"
  }
}
```

### Payment Statistics Response
```json
{
  "total_transactions": 145,
  "total_amount": "45892.50",
  "average_amount": "316.53",
  "successful_payments": 138,
  "failed_payments": 5,
  "pending_payments": 2,
  "currency": "GHS",
  "currency_symbol": "₵",
  "currency_name": "Ghana Cedis"
}
```

## Frontend Implementation for Ghana Users

### 1. Display Currency
```javascript
// Show Ghana Cedis in UI
const CURRENCY = {
  code: 'GHS',
  symbol: '₵'
};

// Display amounts
function formatAmount(amount) {
  return `${CURRENCY.symbol} ${amount.toFixed(2)}`;
}

// Example: ₵ 50.00
```

### 2. Mobile Money Payment Button
```javascript
async function payWithMobileMoneyGH(amount, customerEmail) {
  try {
    // 1. Create sale with Paystack method
    const saleResponse = await fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customerId: customer.id,
        items: cartItems,
        paymentData: {
          method: 'paystack',
          amount: amount,
          email: customerEmail
        }
      })
    });

    const saleData = await saleResponse.json();

    // 2. Initialize payment
    const initResponse = await fetch('/api/payments/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        saleId: saleData.data.saleId,
        amount: amount,
        email: customerEmail,
        customerId: customer.id
      })
    });

    const initData = await initResponse.json();

    // 3. Redirect to Paystack checkout
    window.location.href = initData.data.authorization_url;
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment initialization failed');
  }
}

// Call it
// payWithMobileMoneyGH(50.00, 'customer@example.com');
```

### 3. Handle Payment Return
```javascript
// After customer completes/cancels on Paystack, they return with reference
function handlePaymentReturn() {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get('reference');

  if (reference) {
    fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference })
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          showSuccess(`Payment successful! ${data.data.currency_symbol} ${data.data.amount} received.`);
          redirectToReceipt();
        } else {
          showError('Payment verification failed');
          redirectToCart();
        }
      });
  }
}
```

## Testing Mobile Money Payment

### Test with Sandbox Card
```
Card: 4111 1111 1111 1111
Expiry: Any future date (e.g., 01/25)
CVV: Any 3 digits (e.g., 123)
```

### Test Credentials
- **Test Account**: Available in Paystack dashboard
- **Test Transactions**: Don't charge real accounts
- **Live Switch**: When ready, just update keys to `pk_live_*` and `sk_live_*`

## Ghana Paystack Account Setup

### If you don't have a Paystack account yet:

1. Go to https://paystack.com
2. Click "Create Free Account"
3. Enter business details (Ghana-based)
4. Verify phone number
5. Complete SMS verification
6. Dashboard → Settings → API Keys & Webhooks
7. Copy these keys to `.env`

### Enable Mobile Money (Admin Settings):
1. Dashboard → Settings
2. Business → Payment Channels
3. Enable:
   - ✅ Mobile Money
   - ✅ Card
   - ✅ Bank Transfer
4. Save

## Troubleshooting Ghana Payments

### Issue: "Currency not supported"
**Solution**: Verify Paystack account is Ghana-based and has `GHS` enabled

### Issue: "Mobile Money option not showing"
**Solution**:
1. Enable Mobile Money in Paystack Business settings
2. Check that customer is in Ghana
3. Verify payment amount is > GHS 1.00

### Issue: "Webhook not updating payment"
**Solution**:
1. Check webhook signature (line 164 in PaymentController)
2. Verify webhook URL in Paystack dashboard
3. Check server logs for webhook errors
4. Test webhook manually from Paystack dashboard

### Issue: Amounts showing in kobo instead of GHS
**Solution**:
1. Check PaystackService division by 100 (line 80)
2. Verify database `paid_amount` field

## Pesewa Conversion Reference

| Amount (GHS) | Pesewas | API Value |
|-------------|---------|-----------|
| 1.00        | 100     | 100       |
| 5.00        | 500     | 500       |
| 10.00       | 1,000   | 1000      |
| 50.00       | 5,000   | 5000      |
| 100.00      | 10,000  | 10000     |
| 1,000.00    | 100,000 | 100000    |

## Live Deployment Checklist

For going live in Ghana:

- [ ] Switch to Live Paystack Keys (`pk_live_*`, `sk_live_*`)
- [ ] Update `.env` with live keys
- [ ] Test with real transactions (small amount first)
- [ ] Configure production webhook URL in Paystack
- [ ] Enable SSL/TLS on production domain
- [ ] Set up automated backups
- [ ] Configure email notifications for payments
- [ ] Test Mobile Money payment with MTN/Vodafone
- [ ] Test currency display (₵ symbol)
- [ ] Verify all amount calculations
- [ ] Set up payment alerts and monitoring

## Currency Formatting for Ghana

### Common Formats
```
English (Ghana): ₵ 50.00
Alternative: GHS 50.00
Receipt: 50.00 cedis
```

### Implementation
```javascript
// Use Intl for international formatting
const formatter = new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS'
});

console.log(formatter.format(50)); // Output: GHS 50.00 (or ₵50.00 depending on browser)
```

## Support Resources

- **Paystack Ghana**: https://paystack.com/docs
- **Mobile Money Setup**: https://paystack.com/docs#mobile-money
- **Ghana Payment Guide**: https://paystack.com/support
- **Currency Info**: ISO 4217 Code GHS

