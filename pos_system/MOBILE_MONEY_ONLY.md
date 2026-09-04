# Mobile Money Only Setup - Ghana

## Your Configuration
Your Paystack account is configured for **Mobile Money payments only** in Ghana.

**Supported Networks:**
- ✅ MTN Mobile Money
- ✅ Vodafone Cash
- ✅ AirtelTigo Money

**NOT supported:**
- ❌ Card payments
- ❌ Bank transfers
- ❌ International payments

## How It Works

### Customer Payment Flow
```
1. Customer selects "Pay with Mobile Money"
2. Redirected to Paystack checkout
3. Paystack shows ONLY mobile money networks
4. Customer selects network (MTN/Vodafone/AirtelTigo)
5. Customer enters phone number
6. System deducts from customer's mobile money wallet
7. Payment automatically confirmed via webhook
```

### Amount Handling
```
Display:     ₵50.00 (Ghana Cedis)
Auto-convert: 5000 pesewas (for API)
Network sees: Amount deducted from wallet
Returned to: ₵50.00
```

## Frontend Implementation for Mobile Money Only

### Recommended UI for your account:
```javascript
// Since account is mobile money only, show this message
const paymentMethods = [
  {
    id: 'paystack',
    name: 'Mobile Money (MTN, Vodafone, AirtelTigo)',
    symbol: '₵',
    icon: 'mobile-money-icon'
  },
  {
    id: 'cash',
    name: 'Cash Payment',
    symbol: '₵'
  }
];

function showPaymentOptions() {
  return paymentMethods.map(method => `
    <button onclick="selectPayment('${method.id}')">
      ${method.icon ? `<img src="${method.icon}">` : ''}
      ${method.name}
    </button>
  `);
}
```

### Example Button Text
```
"Pay ₵ 50.00 with Mobile Money"
"Pay ₵ 50.00 with Cash"
```

## Testing Your Mobile Money Account

### Test Scenarios
1. **Successful Mobile Money Payment:**
   - Amount: ₵50.00 (any amount)
   - Phone: Any Ghana number (e.g., +233201234567)
   - Result: Should process successfully

2. **Transaction History:**
   - Check Paystack Dashboard → Transactions
   - All transactions should show as "Mobile Money"
   - Currency should display as GHS

3. **Webhook Confirmation:**
   - Payment completes on customer's phone
   - Webhook fires: `charge.success`
   - Amount: 5000 pesewas (50 GHS)
   - Database updated to ₵50.00

## API Calls for Mobile Money Only

### Create Sale - Mobile Money
```json
POST /api/sales
{
  "customerId": 1,
  "items": [{"productId": 1, "quantity": 1}],
  "paymentData": {
    "method": "paystack",
    "amount": 50.00,
    "email": "customer@example.com"
  }
}
```

### Initialize Mobile Money Payment
```json
POST /api/payments/initialize
{
  "saleId": 42,
  "amount": 50.00,
  "email": "customer@example.com",
  "customerId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorization_url": "https://checkout.paystack.com/abc123...",
    "reference": "PAY-1234567890",
    "amount": 50.00,
    "currency": "GHS",
    "currency_symbol": "₵"
  }
}
```

### Customer Flow:
1. Redirect to `authorization_url`
2. Paystack shows only MTN/Vodafone/AirtelTigo
3. Customer selects their network
4. Enters phone number
5. Confirms payment
6. Money deducted from wallet
7. Redirected back to your app with `?reference=PAY-1234567890`

### Verify Payment
```json
POST /api/payments/verify
{
  "reference": "PAY-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "amount": 50.00,
    "currency": "GHS",
    "paid_at": "2024-03-25T10:30:45Z"
  }
}
```

## Ghana Mobile Money Networks - Quick Reference

### MTN Mobile Money (233)
- **Market Share:** ~45% of mobile money
- **Prefix:** +233 5X (MTN Ghana)
- **USSD:** *170#
- **Daily Limit:** Varies by subscriber tier

### Vodafone Cash (233)
- **Market Share:** ~30% of mobile money
- **Prefix:** +233 5X (Vodafone Ghana)
- **USSD:** *110#
- **Daily Limit:** Varies by subscriber tier

### AirtelTigo Money (233)
- **Market Share:** ~20% of mobile money
- **Prefix:** +233 5X (AirtelTigo Ghana)
- **Features:** USSD, App access
- **Daily Limit:** Varies by subscriber tier

## Production Deployment Checklist

For going live with your Mobile Money account:

- [ ] Update to Live Paystack Keys (pk_live_*, sk_live_*)
- [ ] Update `.env` with live keys
- [ ] Test transaction with real subscriber (small amount)
- [ ] Configure webhook URL in Paystack (if not already done)
- [ ] Enable SSL/TLS on production domain
- [ ] Test all Ghana networks (MTN, Vodafone, AirtelTigo)
- [ ] Verify ₵ currency displays correctly
- [ ] Set up payment notifications
- [ ] Test refund with live transaction
- [ ] Monitor webhook delivery
- [ ] Set up transaction alerts

## Troubleshooting Mobile Money

### Issue: Mobile Money not showing
**Solution:**
- Verify Paystack account is Ghana-based
- Check account has Mobile Money enabled
- Clear browser cache
- Try different network (MTN/Vodafone/AirtelTigo)

### Issue: "Amount must be >0" error
**Solution:**
- Usually minimum is GHS 1.00
- Check Paystack account limits
- Try with GHS 5.00 or more

### Issue: Webhook not firing
**Solution:**
- Check webhook URL is configured in Paystack
- Verify public URL is accessible
- Check server logs
- Test webhook manually from Paystack dashboard

### Issue: Pesewe conversion wrong
**Solution:**
- Should be: GHS × 100 = Pesewas
- Check PaystackService line 40 (amountInPesewas = amount * 100)
- Verify webhook converts back (amount / 100)

## Limits & Fees (Ghana Mobile Money)

| Network | Daily Limit | Paystack Fee |
|---------|------------|--------|
| MTN | GHS 1,000-5,000 | 1.5% + GHS 0.10 |
| Vodafone | GHS 500-2,000 | 1.5% + GHS 0.10 |
| AirtelTigo | GHS 500-2,000 | 1.5% + GHS 0.10 |

*Note: Limits vary by customer tier. Check with Paystack for exact rates.*

## Support

- **Paystack Ghana Support:** support@paystack.com
- **Check Account Status:** https://dashboard.paystack.co/settings/integration
- **Mobile Money Docs:** https://paystack.com/docs#mobile-money

## Your Current Setup Summary

✅ **Currency:** Ghana Cedis (GHS)
✅ **Payment Method:** Mobile Money Only (MTN, Vodafone, AirtelTigo)
✅ **Amount Conversion:** Automatic (GHS ↔ Pesawas)
✅ **Webhook:** Configured for payment confirmation
✅ **Security:** HMAC SHA512 signature verification
✅ **Ready for:** Production deployment
