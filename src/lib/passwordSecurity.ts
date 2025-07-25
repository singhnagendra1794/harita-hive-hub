import { sanitizeInput } from './security';

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number;
}

export class PasswordSecurity {
  private static readonly MIN_LENGTH = 10;
  private static readonly REQUIRED_PATTERNS = [
    { pattern: /[a-z]/, message: 'Must contain at least one lowercase letter' },
    { pattern: /[A-Z]/, message: 'Must contain at least one uppercase letter' },
    { pattern: /\d/, message: 'Must contain at least one digit' },
    { pattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, message: 'Must contain at least one special character' }
  ];

  private static readonly COMMON_PASSWORDS = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
  ];

  /**
   * Validate password strength and security
   */
  public static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Sanitize input first
    const cleanPassword = sanitizeInput(password);
    
    if (cleanPassword !== password) {
      errors.push('Password contains invalid characters');
      return { isValid: false, errors, score: 0 };
    }

    // Length check
    if (password.length < this.MIN_LENGTH) {
      errors.push(`Password must be at least ${this.MIN_LENGTH} characters long`);
    } else {
      score += 20;
    }

    // Pattern checks
    for (const { pattern, message } of this.REQUIRED_PATTERNS) {
      if (!pattern.test(password)) {
        errors.push(message);
      } else {
        score += 15;
      }
    }

    // Common password check
    if (this.COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    } else {
      score += 10;
    }

    // Additional scoring for complexity
    if (password.length >= 15) score += 10;
    if (/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 5;

    const isValid = errors.length === 0;
    return { isValid, errors, score: Math.min(score, 100) };
  }

  /**
   * Generate password strength description
   */
  public static getStrengthDescription(score: number): { text: string; color: string } {
    if (score >= 80) return { text: 'Very Strong', color: 'text-green-600' };
    if (score >= 60) return { text: 'Strong', color: 'text-blue-600' };
    if (score >= 40) return { text: 'Medium', color: 'text-yellow-600' };
    if (score >= 20) return { text: 'Weak', color: 'text-orange-600' };
    return { text: 'Very Weak', color: 'text-red-600' };
  }

  /**
   * Check if password might be leaked (basic check against common patterns)
   */
  public static isLikelyLeaked(password: string): boolean {
    // Check against common patterns that indicate leaked passwords
    const suspiciousPatterns = [
      /^password\d*$/i,
      /^admin\d*$/i,
      /^user\d*$/i,
      /^test\d*$/i,
      /^123+$/,
      /^abc+$/i,
      /^qwerty\d*$/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(password));
  }
}