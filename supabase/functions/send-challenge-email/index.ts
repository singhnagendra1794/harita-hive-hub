import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChallengeEmailRequest {
  name: string;
  email: string;
  challengeName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Challenge email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, challengeName }: ChallengeEmailRequest = await req.json();
    console.log(`Sending challenge email to: ${email} for challenge: ${challengeName}`);

    const emailResponse = await resend.emails.send({
      from: "Harita Hive <contact@haritahive.com>",
      to: [email],
      subject: "You've Registered for the GeoAI Challenge 🎯",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GeoAI Challenge Registration</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🎯 Challenge Registration Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Welcome to Harita Hive's Weekly Challenge</p>
          </div>

          <div style="background: #f8f9ff; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 25px;">
            <h2 style="margin: 0 0 15px 0; color: #333;">Hi ${name},</h2>
            <p style="margin: 0 0 15px 0; font-size: 16px;">You're officially registered for this week's Harita Hive Challenge:</p>
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0;">
              <h3 style="margin: 0 0 10px 0; color: #667eea;">🧠 Build a GeoAI Dashboard using OSM + Python</h3>
              <p style="margin: 0; color: #666;"><strong>Duration:</strong> 21st to 27th July, 2025</p>
              <p style="margin: 5px 0 0 0; color: #666;"><strong>Deadline:</strong> Submit before 27th July 11:59 PM IST</p>
            </div>
          </div>

          <div style="background: white; border: 2px solid #e1e5e9; border-radius: 8px; padding: 25px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">🔗 What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #555;">
              <li style="margin: 8px 0;">Dashboard template & instructions will be shared soon</li>
              <li style="margin: 8px 0;">Check your email for challenge materials on July 21st</li>
              <li style="margin: 8px 0;">Join our community for tips and support</li>
            </ul>
          </div>

          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
            <h3 style="margin: 0 0 10px 0;">🏆 Challenge Rewards</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Winners get featured on our homepage, digital certificates, and access to premium tools!</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://haritahive.com" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Visit Harita Hive</a>
          </div>

          <div style="text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0;">All the best with your challenge! 🚀</p>
            <p style="margin: 10px 0 0 0;"><strong>– Team Harita Hive</strong></p>
            <div style="margin: 20px 0;">
              <a href="https://haritahive.com" style="color: #667eea; text-decoration: none;">🌐 haritahive.com</a>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Challenge email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-challenge-email function:", error);
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