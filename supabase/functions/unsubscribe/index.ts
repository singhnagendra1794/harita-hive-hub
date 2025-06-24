
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const userId = url.searchParams.get('user_id');
  const token = url.searchParams.get('token');

  if (!userId || !token) {
    return new Response('Invalid unsubscribe link', { status: 400 });
  }

  // Verify token (simple base64 check for now)
  if (atob(token) !== userId) {
    return new Response('Invalid unsubscribe token', { status: 400 });
  }

  try {
    // Update user preferences to unsubscribe
    const { error } = await supabase
      .from('user_email_preferences')
      .update({ 
        unsubscribed_at: new Date().toISOString(),
        class_reminders: false,
        newsletter_updates: false,
        onboarding_emails: false,
        marketing_emails: false,
        weekly_digest: false
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
    console.error('Unsubscribe error:', error);
    return new Response('Error processing unsubscribe request', { status: 500 });
  }
};

serve(handler);
