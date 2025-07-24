// Security utility functions for the application
import { supabase } from '@/integrations/supabase/client';

// Rate limiting for client-side requests
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkClientRateLimit(identifier: string, maxRequests = 50, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Input validation utility
export function validateInput<T>(
  input: any, 
  schema: Record<string, { required?: boolean; type?: string; maxLength?: number }>
): { isValid: boolean; errors: string[]; data?: T } {
  const errors: string[] = [];
  const data: any = {};
  
  if (!input || typeof input !== 'object') {
    errors.push('Invalid input format');
    return { isValid: false, errors };
  }
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];
    
    if (rules.required && (!value || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    
    if (value && rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
      continue;
    }
    
    if (value && rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`${field} must be less than ${rules.maxLength} characters`);
      continue;
    }
    
    data[field] = value;
  }
  
  return { isValid: errors.length === 0, errors, data };
}

// Sanitize error messages to prevent information leakage
export function sanitizeError(error: any): string {
  if (error?.message) {
    return error.message
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/password/gi, '[CREDENTIAL]')
      .replace(/token/gi, '[TOKEN]')
      .replace(/key/gi, '[KEY]')
      .replace(/email/gi, '[EMAIL]');
  }
  return 'An error occurred';
}

// Enhanced auth check with timeout
export async function checkAuthWithTimeout(timeoutMs = 5000): Promise<{ user: any; session: any } | null> {
  const authPromise = supabase.auth.getUser();
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Auth check timeout')), timeoutMs)
  );
  
  try {
    const { data } = await Promise.race([authPromise, timeoutPromise]) as any;
    const { data: session } = await supabase.auth.getSession();
    
    if (data.user && session.session) {
      return { user: data.user, session: session.session };
    }
    return null;
  } catch (error) {
    console.error('Auth check failed:', sanitizeError(error));
    return null;
  }
}

// Content Security Policy helper
export function getCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com https://api.supabase.com https://supabase.com wss://",
    "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}

// Enhanced security event logging with database persistence
export async function logSecurityEvent(
  eventType: string, 
  details: Record<string, any>, 
  userId?: string
): Promise<void> {
  try {
    // Use the secure database logging function
    await supabase.rpc('log_security_event_secure', {
      p_event_type: eventType,
      p_details: details,
      p_user_id: userId
    });
  } catch (error) {
    // Fallback to console logging if database logging fails
    console.error('Failed to log security event to database:', error);
    console.log('Security Event:', {
      type: eventType,
      details: sanitizeError(details),
      userId,
      timestamp: new Date().toISOString()
    });
  }
}

// Enhanced input validation with XSS protection
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 1000); // Limit length
}

// File upload validation
export function validateFileUpload(file: File, allowedTypes: string[], maxSizeMB: number): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type ${file.type} not allowed` };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  return { isValid: true };
}

// Enhanced rate limiting with distributed support
export async function checkDistributedRateLimit(
  identifier: string, 
  action: string, 
  maxRequests = 50, 
  windowMs = 60000
): Promise<boolean> {
  const key = `${identifier}:${action}`;
  const now = Date.now();
  
  try {
    // Log rate limit check as security event
    await logSecurityEvent('rate_limit_check', {
      identifier: sanitizeInput(identifier),
      action: sanitizeInput(action),
      maxRequests,
      windowMs
    });

    // Use existing client-side rate limiting as fallback
    return checkClientRateLimit(key, maxRequests, windowMs);
  } catch (error) {
    console.error('Rate limit check failed:', sanitizeError(error));
    return false; // Fail securely by denying access
  }
}