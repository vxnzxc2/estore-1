-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL DEFAULT 'buyer',
  membership VARCHAR(50) NOT NULL DEFAULT 'Free',
  wallet_balance DECIMAL(10, 2) DEFAULT 0,
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo accounts
INSERT INTO users (email, password, name, phone, role, membership, wallet_balance, points)
VALUES
  ('owner@gmail.com', 'hatdog123', 'Owner Admin', '0900-000-0001', 'owner', 'Max', 10000.00, 1000),
  ('employee@gmail.com', 'employee01', 'Employee Account', '0900-000-0002', 'employee', 'Pro', 5000.00, 500),
  ('buyer@gmail.com', 'buyer123', 'Buyer Account', '0900-000-0003', 'buyer', 'Free', 450.25, 0)
ON CONFLICT (email) DO NOTHING;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
