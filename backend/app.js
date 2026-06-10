const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/config');
const apiRoutes = require('./routes');
const morganLogger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const sanitizeInput = require('./middleware/sanitize');

const app = express();

// 1. Security Headers via Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*"],
      connectSrc: ["'self'", "http://localhost:*", "https://*"]
    }
  }
}));

// 2. Strict CORS
const corsOptions = {
  origin: config.CORS_ORIGIN === '*' ? '*' : config.CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id'],
  credentials: true
};
app.use(cors(corsOptions));

// 3. Rate Limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Disable rate limiting in tests for convenience
  skip: () => process.env.NODE_ENV === 'test'
});
app.use('/api', limiter);

// 4. Request parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Input Sanitization
app.use(sanitizeInput);

// 6. Request Logging
app.use(morganLogger);

// 7. API Routes
app.use('/api', apiRoutes);

// 8. Serve Frontend Static files in production
// The frontend build output is expected to be in ../frontend/dist
const frontendBuildPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// Fallback index.html router for SPA routing
app.get('*', (req, res, next) => {
  // If request is for an API endpoint that wasn't matched, send 404
  if (req.originalUrl.startsWith('/api')) {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    return next(error);
  }
  
  // Otherwise serve the built frontend app index.html
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      // If index.html doesn't exist, just send a simple message
      res.status(200).send('C.A.R.B.O.N+ Web App Backend running. Frontend not compiled yet.');
    }
  });
});

// 9. Error Handler
app.use(errorHandler);

module.exports = app;
