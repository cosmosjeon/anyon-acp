import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 4000;
const JWT_SECRET = 'dev-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Mock database (in-memory for development)
const users = new Map();
const sessions = new Map();

// Helper: Generate JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Helper: Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
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

  const user = users.get(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  req.user = user;
  next();
}

// Routes

// Get Google OAuth URL
app.get('/auth/google/url', (req, res) => {
  // In production, this would redirect to actual Google OAuth
  // For development, we create a user and return the token directly
  const userId = uuidv4();
  const user = {
    id: userId,
    email: 'dev@example.com',
    name: 'Dev User',
    profilePicture: 'https://via.placeholder.com/150',
    subscription: {
      planType: 'FREE',
      status: 'ACTIVE',
    },
  };

  users.set(userId, user);
  const token = generateToken(userId);

  // For development, return token directly (no OAuth flow needed)
  res.json({
    url: null,
    devMode: true,
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

// Google OAuth callback (for development)
app.get('/auth/google/callback', (req, res) => {
  const { code } = req.query;

  // In production, exchange code for Google tokens
  // For development, create a mock user
  const userId = uuidv4();
  const user = {
    id: userId,
    email: 'dev@example.com',
    name: 'Dev User',
    profilePicture: 'https://via.placeholder.com/150',
  };

  const subscription = {
    planType: 'FREE',
    status: 'ACTIVE',
  };

  users.set(userId, { ...user, subscription });

  const token = generateToken(userId);

  // Redirect to deep link
  res.redirect(`anyon://auth/callback?token=${token}`);
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

  req.user.subscription = {
    planType,
    status,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  users.set(req.user.id, req.user);

  res.json({ subscription: req.user.subscription });
});

// Development: Create test user
app.post('/dev/create-user', (req, res) => {
  const { email, name, planType = 'FREE' } = req.body;

  const userId = uuidv4();
  const user = {
    id: userId,
    email: email || `test-${Date.now()}@example.com`,
    name: name || 'Test User',
    profilePicture: 'https://via.placeholder.com/150',
    subscription: {
      planType,
      status: 'ACTIVE',
      currentPeriodEnd: planType === 'PRO'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    },
  };

  users.set(userId, user);
  const token = generateToken(userId);

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
  const allUsers = Array.from(users.values()).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    subscription: user.subscription,
  }));

  res.json({ users: allUsers });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Auth Server running on http://localhost:${PORT}`);
  console.log(`\n📝 Development endpoints:`);
  console.log(`   POST /dev/create-user - Create test user`);
  console.log(`   GET  /dev/users - List all users`);
  console.log(`\n🔐 Auth endpoints:`);
  console.log(`   GET  /auth/google/url - Get OAuth URL`);
  console.log(`   GET  /auth/me - Get current user`);
  console.log(`   GET  /auth/verify - Verify token`);
  console.log(`   POST /auth/subscription - Update subscription\n`);
});
