# Database Setup Guide

## 🗄️ Creating the Users Table

Run the migration script to create the users table and add demo accounts:

### Option 1: Using Neon Console
1. Go to your Neon project dashboard
2. Open the SQL editor
3. Copy and paste the contents of `migrations/001_create_users.sql`
4. Execute the query

### Option 2: Using psql CLI
```bash
psql postgresql://neondb_owner:npg_3nkTSKQuXx6J@ep-withered-field-aoqhpyyl-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require < migrations/001_create_users.sql
```

## 📊 Users Table Schema

```sql
CREATE TABLE users (
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
```

## 🔐 Demo Accounts

The migration script automatically adds these three accounts:

| Account | Email | Password | Role | Membership |
|---------|-------|----------|------|-----------|
| Owner | `owner@gmail.com` | `hatdog123` | owner | Max |
| Employee | `employee@gmail.com` | `employee01` | employee | Pro |
| Buyer | `buyer@gmail.com` | `buyer123` | buyer | Free |

## 🔑 User Roles & Permissions

- **Owner** (`owner`) - Full access to Admin Panel
- **Employee** (`employee`) - Full access to Admin Panel
- **Buyer** (`buyer`) - Store access only, NO Admin Panel

## 🔄 How Authentication Works

1. User enters email & password on login page
2. Frontend sends credentials to `/api/auth/login` endpoint
3. Server checks credentials against users table
4. If valid, returns user data with role
5. Frontend stores role and controls UI visibility based on role

## 📡 API Endpoints

### POST `/api/auth/login`
**Request:**
```json
{
  "email": "owner@gmail.com",
  "password": "hatdog123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-1",
    "email": "owner@gmail.com",
    "name": "Owner Admin",
    "role": "owner",
    "membership": "Max",
    "walletBalance": 10000.00,
    "points": 1000
  }
}
```

### GET `/api/users/:email`
Get user by email address.

**Response:** Same as login response

## ✅ After Setup

1. Run the migration to create the users table
2. Start the server: `npm run server`
3. Start the frontend: `npm run dev`
4. Try logging in with any of the demo accounts
5. Test role-based access (Admin Panel shows for owner/employee, hidden for buyer)

## 🔧 Adding New Users

Run this SQL query to add a new user:

```sql
INSERT INTO users (email, password, name, phone, role, membership, wallet_balance, points)
VALUES ('newuser@gmail.com', 'password123', 'New User', '0900-000-0000', 'buyer', 'Free', 0, 0);
```

---

**Note:** Currently passwords are stored in plaintext for demo purposes. In production, use bcrypt or similar for password hashing.
