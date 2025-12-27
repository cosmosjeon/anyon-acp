# SQLite Database - Quick Start Guide

## Installation

```bash
cd server
npm install
```

This will install `better-sqlite3` and all other dependencies.

## Running the Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

On first run, the database will be automatically created at `server/data/anyon.db`.

## Using the Repositories

### User Repository

```javascript
import userRepository from './db/repositories/userRepository.js';
import { createUser } from './models/userFactory.js';

// Create a user
const user = createUser({
  email: 'user@example.com',
  name: 'John Doe',
  planType: 'PRO',
});
userRepository.create(user);

// Find by email
const found = userRepository.findByEmail('user@example.com');

// Update subscription
userRepository.updateSubscription(user.id, {
  planType: 'FREE',
  status: 'ACTIVE',
  currentPeriodEnd: new Date().toISOString(),
});

// Delete
userRepository.delete(user.id);
```

### Settings Repository

```javascript
import settingsRepository from './db/repositories/settingsRepository.js';

// Set individual settings
settingsRepository.set(userId, 'theme', 'dark');
settingsRepository.set(userId, 'notifications', {
  email: true,
  push: false
});

// Get all settings
const settings = settingsRepository.getAll(userId);
// { theme: 'dark', notifications: { email: true, push: false } }

// Get specific setting
const theme = settingsRepository.get(userId, 'theme');
// 'dark'

// Replace all settings
settingsRepository.replaceAll(userId, {
  theme: 'light',
  language: 'en',
});

// Delete specific setting
settingsRepository.delete(userId, 'theme');
```

## Testing

### Run Unit Tests

```bash
node test-db.js
```

### Run Integration Tests

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Run tests
node test-api.js
```

Or use the one-liner:

```bash
node index.js & sleep 2 && node test-api.js; kill %1
```

## Database Management

### View Database

```bash
# Open SQLite CLI
sqlite3 server/data/anyon.db

# Useful SQLite commands:
.tables                    # List all tables
.schema users              # Show table schema
SELECT * FROM users;       # Query users
SELECT * FROM user_settings WHERE user_id = 'xxx';
.quit                      # Exit
```

### Backup Database

```bash
# Simple copy
cp server/data/anyon.db server/data/anyon.db.backup

# Using SQLite backup
sqlite3 server/data/anyon.db ".backup server/data/anyon.db.backup"
```

### Reset Database

```bash
# Delete database
rm server/data/anyon.db

# Restart server to recreate
npm start
```

## API Endpoints

All endpoints remain the same:

### Authentication

```bash
# Dev login
curl -X POST http://localhost:4000/auth/dev/login

# Get user info
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/auth/me

# Update subscription
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planType":"PRO","status":"ACTIVE"}' \
  http://localhost:4000/auth/subscription
```

### Settings

```bash
# Get all settings
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/settings

# Save settings
curl -X POST \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"settings":{"theme":"dark","language":"en"}}' \
  http://localhost:4000/api/settings

# Update specific setting
curl -X PATCH \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"light"}' \
  http://localhost:4000/api/settings/theme

# Delete setting
curl -X DELETE \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:4000/api/settings/theme
```

### Development

```bash
# Create test user
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","planType":"PRO"}' \
  http://localhost:4000/dev/create-user

# List all users
curl http://localhost:4000/dev/users
```

## Troubleshooting

### Database locked error

If you get "database is locked" error:

```bash
# Check for WAL files
ls -l server/data/

# If you see .db-wal or .db-shm files, close all connections and:
rm server/data/anyon.db-wal
rm server/data/anyon.db-shm

# Restart server
npm start
```

### Compile errors with better-sqlite3

Make sure you have build tools installed:

```bash
# macOS
xcode-select --install

# Linux (Ubuntu/Debian)
sudo apt-get install build-essential python3

# Linux (RHEL/CentOS)
sudo yum groupinstall "Development Tools"
sudo yum install python3
```

### Database file permissions

```bash
# Check permissions
ls -l server/data/anyon.db

# Fix if needed
chmod 644 server/data/anyon.db
```

## Performance Tips

1. **Use prepared statements** - Already implemented in repositories
2. **Batch operations** - Use `setAll` or `replaceAll` for multiple settings
3. **Index usage** - Indexes on email and google_id for fast lookups
4. **WAL mode** - Enabled by default for better concurrency

## Migration from In-Memory

No migration needed! The database is created fresh on first run.

If you had data in the in-memory Maps, it was not persistent anyway.

## Environment-Specific Behavior

### Development
- Database: `server/data/anyon.db`
- Verbose SQL logging enabled
- Auto-creates database on startup

### Production (Tauri Bundle)
- Database: `<resourcesPath>/data/anyon.db`
- No SQL logging
- Auto-creates database on first launch

## Additional Resources

- [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [db/README.md](./db/README.md) - Detailed database documentation
- [MIGRATION.md](./MIGRATION.md) - Full migration details
