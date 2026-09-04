-- Migration: Add Paystack fields to payments table
-- Description: Adds columns to support Paystack payment integration

-- Check if paystack_reference column exists, if not add it
ALTER TABLE payments
ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS paystack_access_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'paystack';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_paystack_reference ON payments(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payment_date ON payments(payment_date);
