const logger = require('../services/cloudLogger');
const { errorResponse } = require('../utils/responseFormatter');

/**
 * Express Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error(err.message || 'Unhandled error', {
    method: req.method,
    url: req.url,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Do not expose stack trace in production
  const errorDetails = process.env.NODE_ENV === 'production' ? null : err.errors || err.stack;

  return errorResponse(res, statusCode, message, errorDetails);
};

module.exports = errorHandler;
