-- Add 'pending' status to sales table
ALTER TABLE sales MODIFY COLUMN status ENUM('pending', 'completed', 'cancelled', 'returned') DEFAULT 'completed';

-- Verify the change
SHOW COLUMNS FROM sales WHERE Field='status';
