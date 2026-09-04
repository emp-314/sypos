-- Migration: Add Paystack Payment Support
-- This migration adds Paystack-specific fields to the payments table
-- Run this on existing databases to support the new Paystack payment method

-- Step 1: Add new columns to payments table
ALTER TABLE payments ADD COLUMN paid_amount DECIMAL(15, 2) AFTER amount;
ALTER TABLE payments ADD COLUMN paystack_reference VARCHAR(100) AFTER status;
ALTER TABLE payments ADD COLUMN paystack_access_code VARCHAR(100) AFTER paystack_reference;

-- Step 2: Update method ENUM to include 'paystack'
ALTER TABLE payments MODIFY method ENUM('cash', 'card', 'mobile_money', 'check', 'paystack') NOT NULL;

-- Step 3: Update status ENUM to include 'partially_refunded'
ALTER TABLE payments MODIFY status ENUM('pending', 'completed', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending';

-- Step 4: Add index on paystack_reference for fast lookups
ALTER TABLE payments ADD INDEX idx_paystack_reference (paystack_reference);

-- Step 5: Set default values for existing payments (backward compatibility)
-- For existing payments that are already completed, set paid_amount to amount
UPDATE payments SET paid_amount = amount WHERE status = 'completed' AND paid_amount IS NULL;
