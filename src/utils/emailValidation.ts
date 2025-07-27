// Email validation utilities
export const isValidEmailFormat = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Common disposable email domains to block
const disposableEmailDomains = [
  'tempmail.org', 'guerrillamail.com', '10minutemail.com', 'throwaway.email',
  'mailinator.com', 'yopmail.com', 'temp-mail.org', 'dispostable.com',
  'sharklasers.com', 'getnada.com', 'tempail.com', 'mohmal.com'
];

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableEmailDomains.includes(domain);
};

export const validateEmailComplete = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!isValidEmailFormat(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (isDisposableEmail(email)) {
    return { isValid: false, error: 'Disposable email addresses are not allowed' };
  }

  return { isValid: true };
};