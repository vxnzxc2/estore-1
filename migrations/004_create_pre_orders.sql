-- Create pre_orders table
CREATE TABLE IF NOT EXISTS pre_orders (
  id VARCHAR(255) PRIMARY KEY,
  total DECIMAL(10, 2) NOT NULL,
  down_payment DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  due_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pre_order_items table
CREATE TABLE IF NOT EXISTS pre_order_items (
  id SERIAL PRIMARY KEY,
  pre_order_id VARCHAR(255) NOT NULL REFERENCES pre_orders(id),
  product_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  qty INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
