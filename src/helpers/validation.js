const headers={}

headers.isStrongPassword = async (password) => {
        const minLength = 8;
      
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumeric = /\d/.test(password);
      
        const isStrong =
          password.length >= minLength &&
          hasUppercase &&
          hasLowercase &&
          hasNumeric;
      
        return isStrong;
}


headers.performBlankValidations = async (fields) => {
  for (const [key, value] of Object.entries(fields)) {

    if (await headers.isBlank(value)) {
      return { success: false, message: `${key} cannot be blank` };
    }
  }
  return { success: true };
};

headers.isBlank = async (value) => {
  return value === undefined || value === null || value === '';
};


headers.isValidEmail = async (email) => {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
        const additionalChecks =
          email.length <= 320 && // Maximum email length according to RFC 5321
          email.indexOf('..') === -1 && // Check for consecutive dots
          email.indexOf('.@') === -1 && // Check for dot immediately followed by @
          email.indexOf('@.') === -1 && // Check for @ immediately followed by dot
          !email.startsWith('.') && // Check for leading dot
          !email.endsWith('.'); // Check for trailing dot
      
        return emailRegex.test(email) && additionalChecks;
      
}


module.exports = headers;