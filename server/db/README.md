# Database Layer Documentation

## Overview

This directory contains the SQLite database implementation for the Anyon authentication server. The database layer uses `better-sqlite3` for synchronous, high-performance SQLite operations.

## Structure

```
db/
├── index.js                    # Database initialization and connection
├── schema.js                   # Database schema definitions
└── repositories/
    ├── userRepository.js       # User CRUD operations
    └── settingsRepository.js   # User settings CRUD operations
```

## Database Schema

### Users Table

Stores user account information and subscription details.

```sql
CREATE TABLE users (
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
);
```

### User Settings Table

Stores user-specific settings as key-value pairs with JSON values.

```sql
CREATE TABLE user_settings (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Repositories

### User Repository

**Location:** `repositories/userRepository.js`

**Methods:**

- `create(user)` - Create a new user
- `findById(id)` - Find user by ID
- `findByEmail(email)` - Find user by email
- `findByGoogleId(googleId)` - Find user by Google OAuth ID
- `update(id, user)` - Update user information
- `updateSubscription(id, subscription)` - Update user subscription
- `delete(id)` - Delete user (cascades to settings)
- `list()` - List all users

**Example:**

```javascript
import userRepository from './db/repositories/userRepository.js';
import { createUser } from './models/userFactory.js';

// Create user
const user = createUser({
  email: 'user@example.com',
  name: 'John Doe',
  planType: 'PRO',
});
userRepository.create(user);

// Find user
const foundUser = userRepository.findByEmail('user@example.com');

// Update subscription
userRepository.updateSubscription(user.id, {
  planType: 'FREE',
  status: 'ACTIVE',
  currentPeriodEnd: new Date().toISOString(),
});
```

### Settings Repository

**Location:** `repositories/settingsRepository.js`

**Methods:**

- `set(userId, key, value)` - Set a setting value
- `get(userId, key)` - Get a setting value
- `getAll(userId)` - Get all settings for a user
- `setAll(userId, settings)` - Set multiple settings
- `replaceAll(userId, settings)` - Replace all settings
- `delete(userId, key)` - Delete a setting
- `deleteAll(userId)` - Delete all settings for a user

**Example:**

```javascript
import settingsRepository from './db/repositories/settingsRepository.js';

// Set individual settings
settingsRepository.set(userId, 'theme', 'dark');
settingsRepository.set(userId, 'notifications', { email: true, push: false });

// Get all settings
const settings = settingsRepository.getAll(userId);

// Replace all settings
settingsRepository.replaceAll(userId, {
  theme: 'light',
  language: 'en',
});
```

## Features

### Performance Optimizations

1. **Prepared Statements** - All SQL queries use prepared statements for better performance
2. **WAL Mode** - Write-Ahead Logging enabled for better concurrent access
3. **Foreign Keys** - Foreign key constraints enabled for data integrity
4. **Indexes** - Strategic indexes on frequently queried columns

### Data Integrity

1. **Foreign Key Constraints** - Settings are automatically deleted when a user is deleted
2. **Check Constraints** - Plan types and statuses are validated at database level
3. **Unique Constraints** - Email and Google ID are unique across users
4. **Transactions** - Batch operations use transactions for atomicity

### JSON Support

User settings values are automatically serialized/deserialized to/from JSON:

```javascript
// Set complex object
settingsRepository.set(userId, 'preferences', {
  theme: 'dark',
  fontSize: 14,
  features: ['a', 'b', 'c'],
});

// Get returns parsed object
const prefs = settingsRepository.get(userId, 'preferences');
// prefs = { theme: 'dark', fontSize: 14, features: ['a', 'b', 'c'] }
```

## Database Location

### Development

```
server/data/anyon.db
```

### Production (Bundled Tauri App)

```
<process.resourcesPath>/data/anyon.db
```

## Graceful Shutdown

The database connection is properly closed on application shutdown:

```javascript
import { closeDatabase } from './db/index.js';

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});
```

## Testing

Run database tests:

```bash
# Unit tests
node test-db.js

# API integration tests
node index.js &
node test-api.js
```

## Migration Notes

This implementation replaces the previous in-memory Map-based storage:

- `users` Map → `users` table
- `userSettings` Map → `user_settings` table
- All data is now persisted to disk
- No code changes required in API endpoints (same interface)

## Best Practices

1. **Always use repositories** - Never access the database directly
2. **Use transactions for batch operations** - Already implemented in `setAll` and `replaceAll`
3. **Handle errors** - Repository methods may throw errors
4. **Close on shutdown** - Always call `closeDatabase()` before exit

## Future Enhancements

Potential improvements:

1. Database migrations system (e.g., using `node-pg-migrate` or custom solution)
2. Database backup/restore functionality
3. Query result caching layer
4. Connection pooling (if needed for concurrent access)
5. Audit logging table for user actions
