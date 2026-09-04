-- POS System Database Schema
-- Create Database
CREATE DATABASE IF NOT EXISTS pos_system;
USE pos_system;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  role ENUM('admin', 'manager', 'cashier') DEFAULT 'cashier',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  category_id INT NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT DEFAULT 0,
  reorder_level INT DEFAULT 10,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE,
  INDEX idx_barcode (barcode),
  INDEX idx_category (category_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  customer_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  loyalty_points INT DEFAULT 0,
  total_purchases DECIMAL(15, 2) DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  sale_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  customer_id INT,
  total_amount DECIMAL(15, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(15, 2) NOT NULL,
  status ENUM('completed', 'cancelled', 'returned') DEFAULT 'completed',
  notes TEXT,
  sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_customer (customer_id),
  INDEX idx_date (sale_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sales Items Table
CREATE TABLE IF NOT EXISTS sales_items (
  sale_item_id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  INDEX idx_sale (sale_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  sale_id INT NOT NULL,
  method ENUM('cash', 'card', 'mobile_money', 'check', 'paystack') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  paid_amount DECIMAL(15, 2),
  change_amount DECIMAL(10, 2) DEFAULT 0,
  status ENUM('pending', 'completed', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
  paystack_reference VARCHAR(100),
  paystack_access_code VARCHAR(100),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sale_id) REFERENCES sales(sale_id) ON DELETE CASCADE,
  INDEX idx_method (method),
  INDEX idx_status (status),
  INDEX idx_date (payment_date),
  INDEX idx_paystack_reference (paystack_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inventory Logs Table
CREATE TABLE IF NOT EXISTS inventory_logs (
  log_id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  type ENUM('purchase', 'sale', 'adjustment', 'return') NOT NULL,
  quantity_change INT NOT NULL,
  reference_id INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  INDEX idx_product (product_id),
  INDEX idx_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports Table (for analytics)
CREATE TABLE IF NOT EXISTS daily_reports (
  report_id INT PRIMARY KEY AUTO_INCREMENT,
  report_date DATE NOT NULL,
  total_sales INT DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  total_discount DECIMAL(10, 2) DEFAULT 0,
  total_tax DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_date (report_date),
  INDEX idx_date (report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Admin User (password: admin123 - hashed with bcrypt)
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@possystem.com', '$2b$10$YJVGZfzJvvYnB.q2kJqkNu0QzQ2q/25K2qd3L6m3D7K5A1KqKQPym', 'admin');

-- Seed Categories
INSERT INTO categories (name, description) VALUES
('Electronics', 'Electronic devices and accessories'),
('Beverages', 'Drinks and beverages'),
('Snacks', 'Food snacks and items'),
('Clothing', 'Apparel and fashion items'),
('Medicine', 'Pharmaceuticals and health products');

-- Seed Sample Products
INSERT INTO products (name, category_id, barcode, price, quantity, reorder_level) VALUES
('iPhone 13', 1, '1234567890001', 999.99, 15, 5),
('Samsung Galaxy S22', 1, '1234567890002', 899.99, 12, 5),
('USB-C Cable', 1, '1234567890003', 19.99, 50, 20),
('Cola 500ml', 2, '1234567890004', 2.99, 100, 30),
('Orange Juice 1L', 2, '1234567890005', 4.99, 80, 20),
('Chips Pack', 3, '1234567890006', 3.49, 120, 40),
('Candy Bar', 3, '1234567890007', 1.99, 200, 50),
('T-Shirt', 4, '1234567890008', 29.99, 30, 10),
('Jeans', 4, '1234567890009', 59.99, 20, 8),
('Paracetamol 100mg', 5, '1234567890010', 5.99, 100, 50);

-- Seed Sample Customers
INSERT INTO customers (name, phone, email, address, loyalty_points) VALUES
('John Doe', '555-0001', 'john@example.com', '123 Main St', 150),
('Jane Smith', '555-0002', 'jane@example.com', '456 Oak Ave', 200),
('Bob Johnson', '555-0003', 'bob@example.com', '789 Pine Rd', 50),
('Alice Williams', '555-0004', 'alice@example.com', '321 Elm St', 300),
('Charlie Brown', '555-0005', 'charlie@example.com', '654 Maple Dr', 100);
