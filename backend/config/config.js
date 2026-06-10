require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Limit each IP to 100 requests per window
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  FIRESTORE_PROJECT_ID: process.env.FIRESTORE_PROJECT_ID || '',
  FIRESTORE_DATABASE_ID: process.env.FIRESTORE_DATABASE_ID || '(default)',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};
