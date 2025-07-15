
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rate limiting map
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Security: Input validation function
function validateInput(input: any, required: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input || typeof input !== 'object') {
    errors.push('Invalid input format');
    return { isValid: false, errors };
  }
  
  for (const field of required) {
    if (!input[field] || typeof input[field] !== 'string') {
      errors.push(`Missing or invalid ${field}`);
    }
  }
  
  return { isValid: errors.length === 0, errors };
}

// Security: Rate limiting function
function checkRateLimit(identifier: string, maxRequests = 5, windowMs = 60000): boolean {
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

// Security: Sanitize error messages
function sanitizeError(error: any): string {
  if (error?.message) {
    // Remove sensitive database/system info
    return error.message.replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
                       .replace(/password/gi, '[CREDENTIAL]')
                       .replace(/token/gi, '[TOKEN]')
                       .replace(/key/gi, '[KEY]');
  }
  return 'An error occurred';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const token = url.searchParams.get('token');
    const clientIP = req.headers.get('CF-Connecting-IP') || req.headers.get('X-Forwarded-For') || 'unknown';

    // Security: Rate limiting
    if (!checkRateLimit(clientIP, 10, 60000)) {
      return new Response(`
        <html>
          <body>
            <h1>Too Many Requests</h1>
            <p>Please wait before trying again.</p>
          </body>
        </html>
      `, {
        status: 429,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Security: Input validation
    const validation = validateInput({ user_id: userId, token }, ['user_id', 'token']);
    if (!validation.isValid) {
      return new Response('Invalid unsubscribe link', { status: 400 });
    }

    // Security: Validate token against database (using secure tokens)
    const { data: preferences, error: fetchError } = await supabase
      .from('user_email_preferences')
      .select('unsubscribe_token')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError || !preferences || preferences.unsubscribe_token !== token) {
      return new Response('Invalid or expired unsubscribe token', { status: 401 });
    }

    // Update user preferences to unsubscribe
    const { error } = await supabase
      .from('user_email_preferences')
      .update({ 
        subscribed: false,
        newsletter: false,
        marketing: false,
        class_reminders: false,
        content_updates: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Cancel pending emails
    await supabase
      .from('email_queue')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'pending');

    const htmlResponse = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - GeoSpatial Learning</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .container { background: #f8fafc; padding: 40px; border-radius: 8px; }
          h1 { color: #2563eb; }
          .btn { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Successfully Unsubscribed</h1>
          <p>You have been unsubscribed from all GeoSpatial Learning emails.</p>
          <p>You can update your preferences anytime by logging into your account.</p>
          <a href="${supabaseUrl.replace('//', '//app.')}/dashboard" class="btn">Go to Dashboard</a>
        </div>
      </body>
      </html>
    `;

    return new Response(htmlResponse, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Unsubscribe error:', sanitizeError(error));
    return new Response('Error processing unsubscribe request', { status: 500 });
  }
};

serve(handler);
