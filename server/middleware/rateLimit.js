/**
 * Rate Limiting Middleware
 *
 * MANUAL SETUP REQUIRED:
 * 1. Install express-rate-limit:
 *    npm install express-rate-limit
 *
 * 2. Import in server/index.js:
 *    import { authLimiter, apiLimiter } from './middleware/rateLimit.js';
 *
 * 3. Apply to routes:
 *    app.use('/auth/', authLimiter);
 *    app.use('/api/', apiLimiter);
 */

// Uncomment when express-rate-limit is installed:
// import rateLimit from 'express-rate-limit';

// Authentication endpoints rate limiter (stricter)
// export const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 requests per windowMs
//   message: 'Too many authentication attempts, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// API endpoints rate limiter (more permissive)
// export const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
//   message: 'Too many requests, please try again later.',
//   standardHeaders: true,
//   legacyHeaders: false,
// });

console.warn('⚠️ Rate limiting middleware created but requires express-rate-limit package installation');
