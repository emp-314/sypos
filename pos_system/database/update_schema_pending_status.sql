-- Update sales table to add 'pending' status for Paystack payments
-- This allows sales to be marked as pending until payment is verified

ALTER TABLE sales MODIFY status ENUM('pending', 'completed', 'cancelled', 'returned') DEFAULT 'completed';
