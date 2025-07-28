import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminAlert {
  errorType: string;
  errorMessage: string;
  context: any;
  timestamp: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { errorType, errorMessage, context, timestamp }: AdminAlert = await req.json();

    const emailResponse = await resend.emails.send({
      from: "HaritaHive System <alerts@haritahive.com>",
      to: ["contact@haritahive.com"],
      subject: `🚨 CRITICAL SYSTEM ALERT: ${errorType}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; border-radius: 12px; margin-bottom: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold;">🚨 CRITICAL SYSTEM ALERT</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Immediate attention required</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="margin-bottom: 25px;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">Error Type</h2>
              <p style="margin: 0; font-size: 16px; font-weight: 600; color: #374151;">${errorType.replace(/_/g, ' ').toUpperCase()}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">Error Message</h2>
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.5;">${errorMessage}</p>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">Timestamp</h2>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">${new Date(timestamp).toLocaleString()}</p>
            </div>
            
            ${context && Object.keys(context).length > 0 ? `
            <div style="margin-bottom: 25px;">
              <h2 style="color: #dc2626; margin: 0 0 10px 0; font-size: 18px;">Context Data</h2>
              <pre style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 12px; color: #374151; overflow-x: auto; white-space: pre-wrap;">${JSON.stringify(context, null, 2)}</pre>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://haritahive.com/super-admin-dashboard?tab=errors" 
                 style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                View in Admin Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
            <p>This is an automated alert from HaritaHive System Monitoring</p>
            <p>Please investigate and resolve this issue as soon as possible</p>
          </div>
        </div>
      `,
    });

    console.log("Admin alert email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-admin-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);