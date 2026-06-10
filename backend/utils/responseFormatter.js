/**
 * Format API Success Response
 * @param {object} res Express Response Object
 * @param {number} statusCode HTTP status code (default: 200)
 * @param {string} message Success message
 * @param {any} data Response data
 */
const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Format API Error Response
 * @param {object} res Express Response Object
 * @param {number} statusCode HTTP status code (default: 500)
 * @param {string} message Error message
 * @param {any} errors Specific validation or internal error details
 */
const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  successResponse,
  errorResponse
};
