-- Increase image_url column size to accommodate long URLs (Google Images, etc.)
ALTER TABLE products MODIFY COLUMN image_url VARCHAR(2000) NULL;
