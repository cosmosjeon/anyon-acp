/**
 * Database schema definitions for PostgreSQL
 */

export const SCHEMA = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      profile_picture TEXT,
      google_id TEXT UNIQUE,
      password_hash TEXT,
      email_verified BOOLEAN DEFAULT FALSE,
      plan_type TEXT DEFAULT 'FREE' CHECK(plan_type IN ('FREE', 'PRO')),
      subscription_status TEXT DEFAULT 'ACTIVE' CHECK(subscription_status IN ('ACTIVE', 'CANCELED', 'PAST_DUE')),
      current_period_end TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `,

  userSettings: `
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  authCodes: `
    CREATE TABLE IF NOT EXISTS auth_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      code_type TEXT NOT NULL CHECK(code_type IN ('EMAIL_VERIFY', 'PASSWORD_RESET')),
      code TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      attempts INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  // Indexes for better query performance
  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_auth_codes_user_id ON auth_codes(user_id)',
    'CREATE INDEX IF NOT EXISTS idx_auth_codes_code ON auth_codes(code)',
  ],
};

/**
 * Initialize database schema
 * @param {Pool} pool - PostgreSQL pool instance
 */
export async function initializeSchema(pool) {
  const client = await pool.connect();

  try {
    // Create tables
    await client.query(SCHEMA.users);
    await client.query(SCHEMA.userSettings);
    await client.query(SCHEMA.authCodes);

    // Create indexes
    for (const indexSql of SCHEMA.indexes) {
      await client.query(indexSql);
    }

    // Check and add missing columns (migration)
    const columnsResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
    `);
    const columns = columnsResult.rows.map(row => row.column_name);

    if (!columns.includes('password_hash')) {
      await client.query('ALTER TABLE users ADD COLUMN password_hash TEXT');
      console.log('✅ Added password_hash column to users table');
    }

    if (!columns.includes('email_verified')) {
      await client.query('ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE');
      console.log('✅ Added email_verified column to users table');
    }
  } catch (error) {
    console.error('Schema initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}
