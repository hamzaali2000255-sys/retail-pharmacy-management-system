CREATE DATABASE IF NOT EXISTS pharmacy_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pharmacy_pos;

CREATE TABLE IF NOT EXISTS medicines (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  generic_name VARCHAR(150) NULL,
  barcode VARCHAR(80) NULL UNIQUE,
  category VARCHAR(100) NULL,
  manufacturer VARCHAR(150) NULL,
  batch_no VARCHAR(80) NULL,
  expiry_date DATE NULL,
  purchase_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  box_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  strip_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  tablet_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  tablets_per_strip INT UNSIGNED NOT NULL DEFAULT 10,
  strips_per_box INT UNSIGNED NOT NULL DEFAULT 10,
  stock_tablets INT NOT NULL DEFAULT 0,
  reorder_level INT NOT NULL DEFAULT 10,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_medicine_name (name),
  INDEX idx_expiry (expiry_date)
);

CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(40) NULL,
  address VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sales (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(40) NOT NULL UNIQUE,
  customer_id INT UNSIGNED NULL,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method ENUM('cash','card','bank','credit') NOT NULL DEFAULT 'cash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sale_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sale_id BIGINT UNSIGNED NOT NULL,
  medicine_id INT UNSIGNED NOT NULL,
  unit_type ENUM('tablet','strip','box') NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  tablets_deducted INT UNSIGNED NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  medicine_id INT UNSIGNED NOT NULL,
  movement_type ENUM('purchase','sale','adjustment','return') NOT NULL,
  quantity_tablets INT NOT NULL,
  reference VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);

INSERT INTO medicines (name,generic_name,barcode,category,manufacturer,batch_no,expiry_date,purchase_price,box_price,strip_price,tablet_price,tablets_per_strip,strips_per_box,stock_tablets,reorder_level)
VALUES
('Paracetamol 500mg','Paracetamol','890000000001','Pain Relief','Demo Pharma','DEMO01','2028-12-31',120,180,18,2,10,10,1000,100)
ON DUPLICATE KEY UPDATE name=VALUES(name);
