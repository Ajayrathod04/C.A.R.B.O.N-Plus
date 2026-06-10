const morgan = require('morgan');
const logger = require('../services/cloudLogger');

// Create a custom stream for morgan to write to winston
const stream = {
  write: (message) => logger.info(message.trim())
};

// Skip logging during tests
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'test';
};

const morganMiddleware = morgan(
  ':remote-addr - :method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = morganMiddleware;
