-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image TEXT,
  badge VARCHAR(100),
  stock INT DEFAULT 0,
  stock_unit VARCHAR(10) DEFAULT 'pcs',
  barcode VARCHAR(255),
  is_new BOOLEAN DEFAULT false,
  is_promo BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
