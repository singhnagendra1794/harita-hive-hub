
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  template_name: string;
  recipient_email: string;
  user_id: string;
  template_data: Record<string, any>;
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  console.log('Email service called with method:', req.method);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template_name, recipient_email, user_id, template_data }: EmailRequest = await req.json();
    console.log('Sending email with template:', template_name, 'to:', recipient_email);

    // Check user's email preferences
    const { data: preferences } = await supabase
      .from('user_email_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (preferences?.unsubscribed_at) {
      console.log('User has unsubscribed from emails');
      return new Response(JSON.stringify({ success: false, reason: 'User unsubscribed' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check specific preferences
    if (template_name.includes('class_reminder') && !preferences?.class_reminders) {
      console.log('User has disabled class reminders');
      return new Response(JSON.stringify({ success: false, reason: 'Class reminders disabled' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (template_name.includes('newsletter') && !preferences?.newsletter_updates) {
      console.log('User has disabled newsletter updates');
      return new Response(JSON.stringify({ success: false, reason: 'Newsletter updates disabled' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (template_name.includes('onboarding') && !preferences?.onboarding_emails) {
      console.log('User has disabled onboarding emails');
      return new Response(JSON.stringify({ success: false, reason: 'Onboarding emails disabled' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get email template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('name', template_name)
      .eq('is_active', true)
      .single();

    if (!template) {
      throw new Error(`Template ${template_name} not found or inactive`);
    }

    // Replace template variables
    let subject = template.subject;
    let htmlContent = template.html_content;
    let textContent = template.text_content;

    Object.entries(template_data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
      if (textContent) {
        textContent = textContent.replace(new RegExp(placeholder, 'g'), String(value));
      }
    });

    // Add unsubscribe link
    const unsubscribeUrl = `${supabaseUrl}/functions/v1/unsubscribe?user_id=${user_id}&token=${btoa(user_id)}`;
    htmlContent += `<div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
      <p>You're receiving this email because you're subscribed to GeoSpatial Learning updates.</p>
      <p><a href="${unsubscribeUrl}" style="color: #888;">Unsubscribe</a> | <a href="${supabaseUrl.replace('//', '//app.')}/dashboard" style="color: #888;">Manage Preferences</a></p>
    </div>`;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "GeoSpatial Learning <noreply@geospatiallearning.com>",
      to: [recipient_email],
      subject: subject,
      html: htmlContent,
      text: textContent || subject,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      email_id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
