import pg from 'pg';
import { initializeSchema } from './schema.js';

const { Pool } = pg;

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

// Create connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection and initialize schema
pool.connect()
  .then(async (client) => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();

    // Initialize schema
    await initializeSchema(pool);
    console.log('✅ Database schema initialized');
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err.message);
    process.exit(1);
  });

/**
 * Close database connection gracefully
 */
export async function closeDatabase() {
  console.log('🔒 Closing database connection...');
  await pool.end();
  console.log('✅ Database connection closed');
}

/**
 * Get database pool instance
 * @returns {Pool} PostgreSQL pool instance
 */
export function getDatabase() {
  return pool;
}

/**
 * Execute a query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<QueryResult>}
 */
export async function query(text, params) {
  return pool.query(text, params);
}

export default pool;
