/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validates a password
   * @param {string} password - The password to validate
   * @returns {object} - Validation result with isValid and message
   */
  export const validatePassword = (password) => {
    if (!password || password.length < 6) {
      return {
        isValid: false,
        message: 'Password must be at least 6 characters long'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };
  
  /**
   * Validates that two passwords match
   * @param {string} password - The original password
   * @param {string} confirmPassword - The confirmation password
   * @returns {object} - Validation result with isValid and message
   */
  export const validatePasswordMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return {
        isValid: false,
        message: 'Passwords do not match'
      };
    }
    
    return {
      isValid: true,
      message: ''
    };
  };