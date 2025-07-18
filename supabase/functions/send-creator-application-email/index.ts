import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreatorApplicationRequest {
  name: string;
  email: string;
  areas_of_interest: string[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Creator application email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, areas_of_interest }: CreatorApplicationRequest = await req.json();

    console.log("Sending creator application confirmation to:", email);

    const areasText = areas_of_interest.length > 0 
      ? areas_of_interest.join(", ") 
      : "Not specified";

    const emailResponse = await resend.emails.send({
      from: "Harita Hive <contact@haritahive.com>",
      to: [email],
      subject: "You've Applied to Become a Harita Hive Creator 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Harita Hive</h1>
            <p style="color: #64748b; margin: 5px 0;">Geospatial Technology Community</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Creator Application Received! 🎉</h2>
            
            <p style="color: #475569; line-height: 1.6;">Hi <strong>${name}</strong>,</p>
            
            <p style="color: #475569; line-height: 1.6;">
              Thanks for applying to become a Creator on Harita Hive! We're excited about your interest in sharing knowledge with our geospatial community.
            </p>
            
            <div style="background: white; border-radius: 6px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <h3 style="color: #1e293b; margin-top: 0;">Your Application Details:</h3>
              <p style="color: #475569; margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="color: #475569; margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #475569; margin: 5px 0;"><strong>Areas of Interest:</strong> ${areasText}</p>
            </div>
            
            <p style="color: #475569; line-height: 1.6;">
              We'll review your submission and get back to you within 5-7 business days. Meanwhile, keep inspiring the geospatial community by participating in discussions and sharing your expertise!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://haritahive.com/community" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                Visit Community Hub
              </a>
            </div>
          </div>
          
          <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
            <p>Best regards,<br><strong>– Team Harita Hive 🌍</strong></p>
            <p style="margin-top: 20px;">
              <a href="https://haritahive.com" style="color: #2563eb; text-decoration: none;">haritahive.com</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Creator application email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Creator application confirmation sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-creator-application-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);