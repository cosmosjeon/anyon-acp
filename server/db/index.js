import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeSchema } from './schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine database path based on environment
const NODE_ENV = process.env.NODE_ENV || 'development';
let dbPath;

if (NODE_ENV === 'production') {
  // In production (bundled Tauri app), use application data directory
  dbPath = path.join(process.resourcesPath || __dirname, '../data/anyon.db');
} else {
  // In development, use local data directory
  dbPath = path.join(__dirname, '../data/anyon.db');
}

console.log(`📦 Database path: ${dbPath}`);

// Create database connection
const db = new Database(dbPath, {
  verbose: NODE_ENV === 'development' ? console.log : undefined,
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize schema
initializeSchema(db);

console.log('✅ Database initialized');

/**
 * Close database connection gracefully
 */
export function closeDatabase() {
  console.log('🔒 Closing database connection...');
  db.close();
  console.log('✅ Database connection closed');
}

/**
 * Get database instance
 * @returns {Database} SQLite database instance
 */
export function getDatabase() {
  return db;
}

export default db;
