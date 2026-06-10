/**
 * Simple validation helper
 */
const validateFields = (data, schema) => {
  const errors = {};
  
  for (const field in schema) {
    const rules = schema[field];
    const value = data[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required.`;
      continue;
    }

    if (value !== undefined && value !== null) {
      // Type checks
      if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors[field] = `${field} must be a number.`;
        } else if (rules.min !== undefined && num < rules.min) {
          errors[field] = `${field} must be at least ${rules.min}.`;
        } else if (rules.max !== undefined && num > rules.max) {
          errors[field] = `${field} must be at most ${rules.max}.`;
        }
      } else if (rules.type === 'string') {
        if (typeof value !== 'string') {
          errors[field] = `${field} must be a string.`;
        } else if (rules.enum && !rules.enum.includes(value)) {
          errors[field] = `${field} must be one of: ${rules.enum.join(', ')}.`;
        }
      } else if (rules.type === 'array') {
        if (!Array.isArray(value)) {
          errors[field] = `${field} must be an array.`;
        }
      } else if (rules.type === 'date') {
        if (isNaN(Date.parse(value))) {
          errors[field] = `${field} must be a valid date.`;
        }
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Express middleware validator generator
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { isValid, errors } = validateFields(req.body, schema);
    if (!isValid) {
      const error = new Error('Validation Failed');
      error.statusCode = 400;
      error.errors = errors;
      return next(error);
    }
    next();
  };
};

module.exports = {
  validateFields,
  validateBody
};
