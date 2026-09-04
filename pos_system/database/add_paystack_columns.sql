-- Add Paystack columns to payments table if they don't exist

ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(15,2);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paystack_access_code VARCHAR(100);

-- Verify columns exist
SHOW COLUMNS FROM payments;
