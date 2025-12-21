/**
 * Database schema definitions
 */

export const SCHEMA = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      profile_picture TEXT,
      google_id TEXT UNIQUE,
      plan_type TEXT DEFAULT 'FREE' CHECK(plan_type IN ('FREE', 'PRO')),
      subscription_status TEXT DEFAULT 'ACTIVE' CHECK(subscription_status IN ('ACTIVE', 'CANCELED', 'PAST_DUE')),
      current_period_end TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  userSettings: `
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `,

  // Indexes for better query performance
  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
    'CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
    'CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id)',
  ],
};

/**
 * Initialize database schema
 * @param {Database} db - SQLite database instance
 */
export function initializeSchema(db) {
  // Create tables
  db.exec(SCHEMA.users);
  db.exec(SCHEMA.userSettings);

  // Create indexes
  SCHEMA.indexes.forEach(indexSql => {
    db.exec(indexSql);
  });
}
