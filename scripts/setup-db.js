import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function setupDatabase() {
  const client = await pool.connect()
  try {
    console.log('🔄 Creating users table...')

    // Create table
    await client.query(`
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
      )
    `)
    console.log('✅ Users table created')

    console.log('🔄 Adding demo accounts...')

    // Insert demo accounts
    const result = await client.query(`
      INSERT INTO users (email, password, name, phone, role, membership, wallet_balance, points)
      VALUES
        ('owner@gmail.com', 'hatdog123', 'Owner Admin', '0900-000-0001', 'owner', 'Max', 10000.00, 1000),
        ('employee@gmail.com', 'employee01', 'Employee Account', '0900-000-0002', 'employee', 'Pro', 5000.00, 500),
        ('buyer@gmail.com', 'buyer123', 'Buyer Account', '0900-000-0003', 'buyer', 'Free', 450.25, 0)
      ON CONFLICT (email) DO NOTHING
      RETURNING email, role
    `)

    console.log('✅ Demo accounts added:')
    result.rows.forEach(row => {
      console.log(`   • ${row.email} (${row.role})`)
    })

    console.log('🔄 Creating index...')
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `)
    console.log('✅ Index created')

    console.log('\n🎉 Database setup complete!')
    console.log('\n📝 Demo Accounts:')
    console.log('   Owner:    owner@gmail.com / hatdog123')
    console.log('   Employee: employee@gmail.com / employee01')
    console.log('   Buyer:    buyer@gmail.com / buyer123')
  } catch (err) {
    console.error('❌ Error setting up database:', err.message)
    process.exit(1)
  } finally {
    await client.end()
    await pool.end()
    process.exit(0)
  }
}

setupDatabase()
