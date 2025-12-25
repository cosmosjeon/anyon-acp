import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client } from 'google-auth-library';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import rateLimit from 'express-rate-limit';
import { createUser } from './models/userFactory.js';
import { closeDatabase } from './db/index.js';
import userRepository from './db/repositories/userRepository.js';
import settingsRepository from './db/repositories/settingsRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
// Try multiple paths: bundled resource, development, and parent directory
const envPaths = [
  path.join(process.resourcesPath || '', '.env'),  // Bundled in Tauri app
  path.join(__dirname, '../.env'),                  // Development
  path.join(__dirname, '.env')                      // Same directory
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    break;
  }
}

const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Secure JWT_SECRET handling with production safety check
const JWT_SECRET = process.env.JWT_SECRET;
if (NODE_ENV === 'production' && !JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable must be set in production');
    process.exit(1);
}
const EFFECTIVE_JWT_SECRET = JWT_SECRET || (() => {
    console.warn('⚠️ WARNING: Using development JWT secret. Do NOT use in production!');
    return 'dev-secret-key-UNSAFE-DO-NOT-USE-IN-PRODUCTION';
})();

// Google OAuth Client
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.OAUTH_REDIRECT_URI || 'http://localhost:4000/auth/google/callback'
);

// Gemini AI Client for Support Chat
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const SUPPORT_SYSTEM_PROMPT = `당신은 Anyon 서비스의 AI 서포트입니다.
사용자가 AI 자동 개발 도구를 사용하다가 막히거나 궁금한 점이 있을 때 도움을 줍니다.

역할:
- 에러 메시지 분석 및 해결 방법 안내
- 워크플로우 사용법 설명
- 기획문서 작성 팁 제공
- 개발 진행 상황 관련 질문 답변

톤:
- 친근하고 격려하는 톤 유지
- 기술 용어는 쉽게 풀어서 설명
- 모르는 것은 솔직히 "잘 모르겠어요"라고 답변
- 복잡한 문제는 카카오톡 상담 권유

제약:
- 코드를 직접 작성해주지 않음 (개발 워크플로우가 처리)
- 외부 서비스 관련 질문은 답변 불가
- 민감한 정보 요청 거부`;

// CORS Configuration - only allow specific origins
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4000',  // Self
  'tauri://localhost',      // Tauri app
  'https://tauri.localhost' // Tauri app (alternative)
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Rate limiting - prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // stricter limit for sensitive endpoints
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to auth routes
app.use('/auth', authLimiter);
app.use('/dev', strictLimiter);

// Load OAuth callback HTML template
const oauthCallbackTemplate = readFileSync(
  path.join(__dirname, 'views', 'oauth-callback.html'),
  'utf-8'
);

// Helper: Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, EFFECTIVE_JWT_SECRET, { expiresIn: '7d' });
}

// Helper: Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, EFFECTIVE_JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Middleware: Authenticate request
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = userRepository.findById(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = user;
  next();
}

// Routes

// Dev Login endpoint - simplified version
app.post('/auth/dev/login', (req, res) => {
  // Check if dev user already exists
  let user = userRepository.findByEmail('dev@example.com');

  if (!user) {
    // Create new dev user
    user = createUser({
      email: 'dev@example.com',
      name: 'Dev User',
      planType: 'PRO',
    });
    userRepository.create(user);
  }

  const token = generateToken(user.id);

  return res.json({
    token: token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
    },
    subscription: user.subscription,
  });
});

// Get Google OAuth URL
app.get('/auth/google/url', (req, res) => {
  // Always return Google OAuth URL
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  res.json({
    url: authUrl,
    devMode: false, // Always false for this endpoint to force redirect
  });
});

// Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Authorization code is missing');
  }

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Check if user exists
    let user = userRepository.findByEmail(email);

    if (!user) {
      // Create new user
      user = createUser({
        email,
        name,
        googleId,
        profilePicture: picture,
        planType: 'FREE',
      });
      userRepository.create(user);
    }

    // Generate JWT token
    const jwtToken = generateToken(user.id);

    // Serve HTML page with deep link
    const deepLink = `anyon://auth/callback?token=${jwtToken}`;
    const html = oauthCallbackTemplate.replace(/\{\{DEEP_LINK\}\}/g, deepLink);
    res.send(html);
  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Get current user info
app.get('/auth/me', authenticate, (req, res) => {
  const { id, email, name, profilePicture, subscription } = req.user;

  res.json({
    user: { id, email, name, profilePicture },
    subscription,
  });
});

// Verify token
app.get('/auth/verify', authenticate, (req, res) => {
  res.json({ valid: true });
});

// Update subscription (for testing)
app.post('/auth/subscription', authenticate, (req, res) => {
  const { planType, status } = req.body;

  if (!['FREE', 'PRO'].includes(planType)) {
    return res.status(400).json({ error: 'Invalid plan type' });
  }

  if (!['ACTIVE', 'CANCELED', 'PAST_DUE'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const subscription = {
    planType,
    status,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const updatedUser = userRepository.updateSubscription(req.user.id, subscription);

  res.json({ subscription: updatedUser.subscription });
});

// Development: Create test user
app.post('/dev/create-user', (req, res) => {
  const { email, name, planType = 'FREE' } = req.body;

  const userName = name || 'Test User';
  const user = createUser({
    email: email || `test-${Date.now()}@example.com`,
    name: userName,
    profilePicture: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff&size=150`,
    planType,
  });

  userRepository.create(user);
  const token = generateToken(user.id);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
    },
    subscription: user.subscription,
    token,
  });
});

// Development: List all users
app.get('/dev/users', (req, res) => {
  const allUsers = userRepository.list().map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    subscription: user.subscription,
  }));

  res.json({ users: allUsers });
});

// Get user settings
app.get('/api/settings', authenticate, (req, res) => {
  const settings = settingsRepository.getAll(req.user.id);
  res.json({ settings });
});

// Save user settings (full replace)
app.post('/api/settings', authenticate, (req, res) => {
  const { settings } = req.body;

  if (!settings || typeof settings !== 'object') {
    return res.status(400).json({ error: 'Invalid settings object' });
  }

  settingsRepository.replaceAll(req.user.id, settings);
  res.json({ success: true, settings });
});

// Update specific setting
app.patch('/api/settings/:key', authenticate, (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  settingsRepository.set(req.user.id, key, value);

  res.json({ success: true, key, value });
});

// Delete specific setting
app.delete('/api/settings/:key', authenticate, (req, res) => {
  const { key } = req.params;

  settingsRepository.delete(req.user.id, key);

  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// AI Support Chat Endpoint (Gemini + SSE)
// ============================================

app.post('/api/support/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  if (!genAI) {
    return res.status(503).json({ error: 'AI service not configured. Set GEMINI_API_KEY.' });
  }

  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // nginx 버퍼링 비활성화

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 대화 히스토리 변환 (마지막 메시지 제외)
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({
      history,
      systemInstruction: SUPPORT_SYSTEM_PROMPT,
    });

    // 마지막 메시지로 스트리밍 응답 생성
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('❌ Support chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to get AI response' })}\n\n`);
    res.end();
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Auth Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`\n📝 Development endpoints:`);
  console.log(`   POST /dev/create-user - Create test user`);
  console.log(`   GET  /dev/users - List all users`);
  console.log(`\n🔐 Auth endpoints:`);
  console.log(`   GET  /auth/google/url - Get OAuth URL`);
  console.log(`   GET  /auth/me - Get current user`);
  console.log(`   GET  /auth/verify - Verify token`);
  console.log(`   POST /auth/subscription - Update subscription`);
  console.log(`\n⚙️  Settings endpoints:`);
  console.log(`   GET    /api/settings - Get user settings`);
  console.log(`   POST   /api/settings - Save user settings`);
  console.log(`   PATCH  /api/settings/:key - Update specific setting`);
  console.log(`   DELETE /api/settings/:key - Delete specific setting`);
  console.log(`\n🤖 Support Chat endpoints:`);
  console.log(`   POST /api/support/chat - AI support chat (SSE streaming)\n`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);

  server.close(() => {
    console.log('✅ HTTP server closed');
    closeDatabase();
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
