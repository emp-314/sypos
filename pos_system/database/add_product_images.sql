-- Add image_url column to products table
ALTER TABLE products ADD COLUMN image_url VARCHAR(500) NULL AFTER barcode;

-- Create index for faster queries
CREATE INDEX idx_image_url ON products(image_url);
