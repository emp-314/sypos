-- Add 'pending' status to sales table ENUM

ALTER TABLE sales MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'returned') DEFAULT 'completed';

-- Verify the change
DESCRIBE sales;
