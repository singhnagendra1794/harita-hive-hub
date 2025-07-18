import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  templateName: string;
  to: string;
  userId?: string;
  templateData?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase clients
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { templateName, to, userId, templateData = {} }: EmailRequest = await req.json();

    // Check user's email preferences if userId is provided
    if (userId) {
      const { data: preferences } = await supabaseClient
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Check if user has unsubscribed from this type of email
      if (preferences?.newsletter_updates === false && templateName.includes('newsletter')) {
        return new Response(
          JSON.stringify({ message: "User has unsubscribed from newsletter emails" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (preferences?.class_reminders === false && templateName.includes('class')) {
        return new Response(
          JSON.stringify({ message: "User has unsubscribed from class reminders" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (preferences?.onboarding_emails === false && templateName.includes('onboard')) {
        return new Response(
          JSON.stringify({ message: "User has unsubscribed from onboarding emails" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Get email template
    const { data: template, error: templateError } = await supabaseClient
      .from('email_templates')
      .select('*')
      .eq('name', templateName)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Replace template variables
    let htmlContent = template.html_content;
    let subject = template.subject;

    // Replace placeholders with actual data
    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
    });

    // Add unsubscribe link
    const unsubscribeUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsubscribe?email=${encodeURIComponent(to)}`;
    htmlContent += `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="color: #666; font-size: 12px;">
          Don't want to receive these emails? 
          <a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
        </p>
      </div>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Harita Hive <hello@haritahive.com>",
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (emailResponse.error) {
      throw emailResponse.error;
    }

    // Log successful email sending (optional)
    console.log(`Email sent successfully to ${to}:`, emailResponse);

    return new Response(
      JSON.stringify({ message: "Email sent successfully", id: emailResponse.data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);