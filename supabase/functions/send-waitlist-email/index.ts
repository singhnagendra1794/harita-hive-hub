import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistEmailRequest {
  email: string;
  fullName?: string;
  courseName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      console.log('User authenticated:', user?.email || 'anonymous');
    }

    const { email, fullName, courseName }: WaitlistEmailRequest = await req.json();

    console.log('Sending waitlist email to:', email, 'for course:', courseName);

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "Harita Hive <contact@haritahive.com>",
      to: [email],
      subject: "You're on the waitlist! 🌍",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin-bottom: 10px;">🌍 You're on the waitlist!</h1>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.5;">
              ${fullName ? `Hi ${fullName},` : 'Hello!'}
            </p>
            
            <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.5;">
              Thank you for joining the waitlist for <strong>${courseName}</strong> on Harita Hive.
            </p>
            
            <p style="margin: 0 0 15px 0; font-size: 16px; line-height: 1.5;">
              We'll notify you as soon as enrollment opens. In the meantime, explore our dashboard, tools, and connect with our geospatial community.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://haritahive.com/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
              Explore Dashboard
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #64748b;">
              🌐 <a href="https://haritahive.com" style="color: #2563eb; text-decoration: none;">https://haritahive.com</a>
            </p>
            <p style="margin: 0; font-size: 14px; color: #64748b;">
              – Team Harita Hive
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
              You received this email because you joined the waitlist for ${courseName}.<br>
              If you didn't sign up for this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      throw emailResponse.error;
    }

    console.log("Waitlist email sent successfully:", emailResponse.data?.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Waitlist confirmation email sent",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-waitlist-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to send email",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);