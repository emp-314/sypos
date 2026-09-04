-- Fix payments table to allow multiple Paystack payments per sale
-- Run this SQL to fix the database structure

ALTER TABLE payments MODIFY COLUMN sale_id INT NOT NULL;
ALTER TABLE payments DROP INDEX sale_id;
ALTER TABLE payments ADD INDEX idx_sale_id (sale_id);
