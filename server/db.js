import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const db = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Connect to database with error handling
try {
  await db.connect();
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  console.error('Database config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    ssl: process.env.NODE_ENV === 'production' ? 'enabled' : 'disabled'
  });
  throw error;
}

export default db;
