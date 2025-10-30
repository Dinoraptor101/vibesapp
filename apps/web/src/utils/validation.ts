/**
 * Input validation and sanitization utilities
 */

// Basic validation patterns
export const ValidationPatterns = {
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PIGEON_ID: /^[A-Z0-9]{8,12}$/,
  YEAR: /^\d{4}$/,
  MONTH: /^(0?[1-9]|1[0-2])$/,
  PHONE: /^\+?[\d\s\-()]{10,}$/,
} as const;

/**
 * Sanitize user input by removing potentially harmful characters
 */
export const sanitizeUserInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .substring(0, 1000); // Limit length
};

/**
 * Sanitize HTML content (basic implementation)
 * For production, consider using DOMPurify or similar library
 */
export const sanitizeHtml = (html: string): string => {
  // Simple HTML sanitization - just remove script tags and other dangerous elements
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

/**
 * Validation functions
 */
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeUserInput(username);

  if (!sanitized) {
    return { isValid: false, error: 'Username is required' };
  }

  if (sanitized.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' };
  }

  if (sanitized.length > 20) {
    return { isValid: false, error: 'Username must be no more than 20 characters' };
  }

  if (!ValidationPatterns.USERNAME.test(sanitized)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens',
    };
  }

  return { isValid: true };
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeUserInput(email);

  if (!sanitized) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!ValidationPatterns.EMAIL.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

export const validateBirthYear = (year: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeUserInput(year);
  const yearNum = parseInt(sanitized, 10);
  const currentYear = new Date().getFullYear();

  if (!ValidationPatterns.YEAR.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid year' };
  }

  if (yearNum < currentYear - 100) {
    return { isValid: false, error: 'Year cannot be more than 100 years ago' };
  }

  if (yearNum > currentYear - 13) {
    return { isValid: false, error: 'You must be at least 13 years old' };
  }

  return { isValid: true };
};

export const validateBirthMonth = (month: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeUserInput(month);
  const monthNum = parseInt(sanitized, 10);

  if (!ValidationPatterns.MONTH.test(sanitized)) {
    return { isValid: false, error: 'Please select a valid month' };
  }

  if (monthNum < 1 || monthNum > 12) {
    return { isValid: false, error: 'Month must be between 1 and 12' };
  }

  return { isValid: true };
};

export const validatePigeonId = (pigeonId: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeUserInput(pigeonId).toUpperCase();

  if (!sanitized) {
    return { isValid: false, error: 'Pigeon ID is required' };
  }

  if (!ValidationPatterns.PIGEON_ID.test(sanitized)) {
    return { isValid: false, error: 'Pigeon ID must be 8-12 uppercase letters and numbers' };
  }

  return { isValid: true };
};

export const validatePostText = (
  text: string
): { isValid: boolean; error?: string; sanitized: string } => {
  const sanitized = sanitizeUserInput(text);

  if (!sanitized.trim()) {
    return { isValid: false, error: 'Post content cannot be empty', sanitized };
  }

  if (sanitized.length > 500) {
    return { isValid: false, error: 'Post content cannot exceed 500 characters', sanitized };
  }

  return { isValid: true, sanitized };
};

type ValidatorFunction<T> = (_value: T) => { isValid: boolean; error?: string };

/**
 * Form validation helper
 */
export const validateForm = <T extends Record<string, unknown>>(
  formData: T,
  validators: Record<keyof T, ValidatorFunction<T[keyof T]>>
): { isValid: boolean; errors: Record<keyof T, string> } => {
  const errors = {} as Record<keyof T, string>;

  const fieldNames = Object.keys(formData) as (keyof T)[];
  for (const field of fieldNames) {
    const validator = validators[field];
    if (validator) {
      const result = validator(formData[field]);
      if (!result.isValid && result.error) {
        errors[field] = result.error;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Escape special characters for use in regular expressions
 */
export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Check if a string contains only safe characters
 */
export const isSafeString = (input: string): boolean => {
  // Disallow certain patterns that might be malicious
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(input));
};
