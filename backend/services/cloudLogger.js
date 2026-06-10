const winston = require('winston');
const config = require('../config/config');

// Define log level based on environment
const logLevel = config.NODE_ENV === 'production' ? 'info' : 'debug';

// Structured logging format
const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const errorStack = stack ? `\n${stack}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaString}${errorStack}`;
  })
);

let logger;

try {
  // If we are in production and running on GCP, we could integrate @google-cloud/logging-winston.
  // To avoid runtime dependency installation issues, we use Winston with structured JSON formatting for GCP Cloud Logging compatibility.
  // Cloud Run captures stdout/stderr in JSON format, which automatically parses in Cloud Logging.
  const transports = [
    new winston.transports.Console({
      format: config.NODE_ENV === 'production' 
        ? winston.format.combine(winston.format.timestamp(), winston.format.json())
        : winston.format.combine(winston.format.colorize(), customFormat)
    })
  ];

  logger = winston.createLogger({
    level: logLevel,
    transports
  });

  logger.info('Structured logger initialized successfully.');
} catch (error) {
  // Fallback to basic console logger if winston initialization fails
  console.error('Failed to initialize winston logger, falling back to console:', error);
  logger = {
    info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
    error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
    debug: (msg, ...args) => console.debug(`[DEBUG] ${msg}`, ...args),
  };
}

module.exports = logger;
