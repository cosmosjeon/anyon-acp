# Auth Server Architecture

> Node.js + Express Backend

## Overview

| Property | Value |
|----------|-------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express 4.18.2 |
| **Type** | ES Module |
| **Port** | 4000 |
| **Database** | SQLite (better-sqlite3) |

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Express | 4.18.2 | HTTP server |
| **Database** | better-sqlite3 | 11.8.1 | SQLite bindings |
| **Auth** | google-auth-library | 10.5.0 | Google OAuth |
| | jsonwebtoken | 9.0.2 | JWT tokens |
| **AI** | @anthropic-ai/sdk | - | Claude API proxy |
| | @google/generative-ai | - | Gemini support chat |
| **Security** | express-rate-limit | - | Rate limiting |
| **Utilities** | cors | 2.8.5 | CORS middleware |
| | dotenv | 17.2.3 | Env variables |
| | uuid | 9.0.1 | ID generation |

---

## API Endpoints

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/auth/google/url` | No | Get OAuth URL |
| `GET` | `/auth/google/callback` | No | OAuth callback |
| `GET` | `/auth/me` | Yes | Current user |
| `GET` | `/auth/verify` | Yes | Validate token |
| `POST` | `/auth/logout` | Yes | Logout (invalidate token) |
| `POST` | `/auth/subscription` | Yes | Update subscription |
| `POST` | `/auth/dev/login` | No | Dev quick login |

### Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/settings` | Yes | Get all settings |
| `POST` | `/api/settings` | Yes | Save settings |
| `PATCH` | `/api/settings/:key` | Yes | Update setting |
| `DELETE` | `/api/settings/:key` | Yes | Delete setting |

### Development

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/dev/create-user` | No | Create test user |
| `GET` | `/dev/users` | No | List all users |
| `GET` | `/health` | No | Health check |

### Claude API Proxy

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/v1/messages` | Yes* | Anthropic API compatible endpoint |
| `POST` | `/api/claude/messages` | Yes | Legacy Claude chat (SSE streaming) |
| `GET` | `/api/claude/usage` | Yes | Get daily usage statistics |
| `GET` | `/api/claude/status` | No | Check Claude API availability |

*Uses x-api-key or Authorization header with JWT

### Support Chat

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/support/chat` | No | AI support chat (Gemini, SSE streaming) |

---

## Authentication Flow

### Google OAuth

```
1. GET /auth/google/url
   ↓
   Returns: { url: "https://accounts.google.com/..." }

2. User redirected to Google
   ↓
   Google authentication

3. GET /auth/google/callback?code=xxx
   ↓
   - Exchange code for tokens
   - Verify ID token
   - Extract user info
   - Create/find user
   - Generate JWT
   ↓
   Returns: HTML with deep link
   anyon://auth/callback?token=xxx
```

### JWT Structure

```javascript
// Payload
{
  userId: "uuid",
  iat: 1703016000,  // issued at
  exp: 1703620800   // expires (7 days)
}

// Signing: HS256 with JWT_SECRET
```

### Middleware

```javascript
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  // Check if token is blacklisted (logged out)
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: 'Invalid token' });

  const user = userRepository.findById(decoded.userId);
  if (!user) return res.status(401).json({ error: 'User not found' });

  req.user = user;
  req.token = token; // Store token for logout
  next();
}
```

### Rate Limiting

```javascript
// Auth routes: 100 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Sensitive endpoints: 20 requests per 15 minutes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

app.use('/auth', authLimiter);
app.use('/dev', strictLimiter);
```

### Token Blacklist

```javascript
// In-memory blacklist for logged out tokens
const tokenBlacklist = new Set();

// Automatic cleanup every hour
setInterval(() => {
  // Remove expired tokens from blacklist
}, TOKEN_BLACKLIST_CLEANUP_INTERVAL);
```

---

## Data Models

### User

```javascript
{
  id: "uuid",
  email: "user@example.com",
  name: "User Name",
  profilePicture: "https://...",
  googleId: "google-sub-id",
  subscription: {
    planType: "FREE" | "PRO",
    status: "ACTIVE" | "CANCELED" | "PAST_DUE",
    currentPeriodEnd: "2024-01-19T00:00:00.000Z"
  }
}
```

### Settings

```javascript
{
  theme: "dark",
  language: "ko",
  notifications: true,
  // ... flexible key-value
}
```

---

## Storage

### SQLite Database

```
server/
├── db/
│   ├── index.js                 # DB 연결 및 초기화
│   ├── schema.js                # 스키마 정의
│   └── repositories/
│       ├── userRepository.js    # User CRUD
│       └── settingsRepository.js # Settings CRUD
└── data/
    └── anyon.db                 # SQLite 파일
```

### Database Schema

```sql
-- 사용자 테이블
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  profile_picture TEXT,
  google_id TEXT UNIQUE,
  plan_type TEXT DEFAULT 'FREE' CHECK(plan_type IN ('FREE', 'PRO')),
  subscription_status TEXT DEFAULT 'ACTIVE',
  current_period_end TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 사용자 설정 (Key-Value)
CREATE TABLE user_settings (
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  PRIMARY KEY (user_id, key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Repository Pattern

```javascript
// userRepository.js
export function findById(id) { ... }
export function findByEmail(email) { ... }
export function findByGoogleId(googleId) { ... }
export function create(userData) { ... }
export function update(id, updates) { ... }
export function findAll() { ... }

// settingsRepository.js
export function getAll(userId) { ... }
export function get(userId, key) { ... }
export function set(userId, key, value) { ... }
export function delete(userId, key) { ... }
export function replaceAll(userId, settings) { ... }
```

### Graceful Shutdown

```javascript
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down...`);
  db.close();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
```

> **Note**: Data persists across server restarts. WAL mode enabled for performance.

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 4000 | Server port |
| `NODE_ENV` | No | development | Environment |
| `JWT_SECRET` | Yes* | dev-secret | JWT signing key |
| `GOOGLE_CLIENT_ID` | Yes* | - | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes* | - | OAuth secret |
| `OAUTH_REDIRECT_URI` | No | localhost:4000/... | Callback URL |
| `GEMINI_API_KEY` | No | - | Gemini AI for support chat |
| `ANYON_ANTHROPIC_API_KEY` | No | - | Claude API proxy key |

*Required for production

---

## .env File Location

Server searches in order:
1. `process.resourcesPath/.env` (bundled)
2. `../` (project root)
3. `.` (server directory)

---

## Error Handling

### Response Format

```javascript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  error: "Error message"
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 400 | Bad request (validation) |
| 401 | Unauthorized |
| 500 | Server error |

---

## Deep Linking

### OAuth Callback Response

```html
<!DOCTYPE html>
<html>
<head><title>Login Success</title></head>
<body>
  <h1>로그인 성공!</h1>
  <p>앱으로 돌아갑니다...</p>
  <script>
    window.location.href = 'anyon://auth/callback?token=xxx';
  </script>
</body>
</html>
```

### Protocol

- Scheme: `anyon://`
- Path: `auth/callback`
- Query: `token={jwt}`

---

## Development Features

### Dev Login

```bash
POST /auth/dev/login

# Response
{
  "token": "eyJhbG...",
  "user": {
    "id": "uuid",
    "email": "dev@example.com",
    "name": "Dev User"
  },
  "subscription": {
    "planType": "PRO",
    "status": "ACTIVE"
  }
}
```

### Create Test User

```bash
POST /dev/create-user
{
  "email": "test@example.com",
  "name": "Test User",
  "planType": "PRO"
}
```

---

## Startup

### Console Output

```
🚀 Auth Server running on http://localhost:4000
📦 Environment: development
🔐 Google OAuth: ✅ Configured

Development endpoints:
   POST /dev/create-user - Create test user
   GET  /dev/users - List all users
```

### Scripts

```bash
# Development (with file watching)
npm run dev

# Production
npm start
```

---

## Claude API Proxy

### Overview

Anthropic API 호환 프록시로, Claude Code가 `ANTHROPIC_BASE_URL`로 이 서버를 사용할 수 있습니다.

### Usage Tracking

```javascript
// 일일 사용량 제한
const DAILY_LIMIT_USD = 5.0;

// 모델별 토큰 비용 (USD)
const MODEL_PRICING = {
  'claude-sonnet-4-20250514': { input: 3.0/1M, output: 15.0/1M },
  'claude-opus-4-20250514': { input: 15.0/1M, output: 75.0/1M },
  'claude-3-5-sonnet-20241022': { input: 3.0/1M, output: 15.0/1M },
  'claude-3-5-haiku-20241022': { input: 0.8/1M, output: 4.0/1M },
};
```

### Authentication

```javascript
// x-api-key 또는 Authorization 헤더에서 JWT 추출
function authenticateAnthropicStyle(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const authHeader = req.headers.authorization;
  // JWT 검증 후 사용자 조회
}
```

### Response Format

```javascript
// Usage endpoint response
{
  userId: "uuid",
  date: "2025-12-25",
  usedUSD: 2.5,
  limitUSD: 5.0,
  remainingUSD: 2.5,
  percentUsed: 50
}
```

---

## Security Considerations

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random key
- [ ] Configure proper Google OAuth credentials
- [ ] Remove `/dev/*` endpoints
- [x] ~~Replace in-memory storage with database~~ (SQLite 구현 완료)
- [x] ~~Add rate limiting~~ (express-rate-limit 구현 완료)
- [ ] Enable HTTPS/TLS
- [x] ~~Restrict CORS origins~~ (allowedOrigins 설정 완료)
- [ ] Add request logging

### Token Security

- Tokens expire after 7 days
- Stored client-side in localStorage
- Passed via Authorization header
- Never logged or exposed

---

## Integration

### With Desktop (Tauri)

Tauri embeds its own auth server (`auth_server.rs`) for:
- Local development
- Bundled deployment

The Node.js server is primarily for:
- External/production deployment
- Independent development

### With Frontend

```javascript
// Frontend API calls
const response = await fetch('http://localhost:4000/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```
