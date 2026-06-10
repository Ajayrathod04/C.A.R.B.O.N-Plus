/**
 * Validates that a value is not null, undefined, or empty string.
 * @param {*} val 
 * @returns {boolean} True if value is present
 */
export const validateRequired = (val) => {
  return val !== undefined && val !== null && val !== '';
};

/**
 * Validates that a value is a valid non-negative number.
 * @param {*} val 
 * @returns {boolean} True if valid non-negative number
 */
export const validatePositiveNumber = (val) => {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
};
