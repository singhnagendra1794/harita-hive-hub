import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CorporateInquiryRequest {
  name: string;
  organization: string;
  email: string;
  teamSize: string;
  areasOfInterest: string[];
  additionalInfo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { name, organization, email, teamSize, areasOfInterest, additionalInfo }: CorporateInquiryRequest = await req.json();

    console.log("Processing corporate inquiry for:", email);

    // Store the inquiry in the database
    const { error: dbError } = await supabase
      .from("corporate_inquiries")
      .insert({
        name,
        organization,
        email,
        team_size: teamSize,
        areas_of_interest: areasOfInterest,
        additional_info: additionalInfo,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }

    // Send confirmation email to the user
    const userEmailResponse = await resend.emails.send({
      from: "Harita Hive <contact@haritahive.com>",
      to: [email],
      subject: "Thank You for Your Corporate Training Inquiry",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #2563eb; text-align: center;">Thank You for Your Interest!</h1>
          
          <p>Dear ${name},</p>
          
          <p>Thank you for your inquiry about our corporate geospatial training programs. We have received your request and our team will contact you within 24 hours to discuss your training needs.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Your Inquiry Details:</h3>
            <ul style="color: #6b7280;">
              <li><strong>Organization:</strong> ${organization}</li>
              <li><strong>Team Size:</strong> ${teamSize}</li>
              <li><strong>Areas of Interest:</strong> ${areasOfInterest.join(", ")}</li>
              ${additionalInfo ? `<li><strong>Additional Information:</strong> ${additionalInfo}</li>` : ""}
            </ul>
          </div>
          
          <p>In the meantime, feel free to explore our <a href="https://haritahive.com" style="color: #2563eb;">learning platform</a> to see what we offer.</p>
          
          <p>Best regards,<br>
          The Harita Hive Team<br>
          <a href="mailto:contact@haritahive.com" style="color: #2563eb;">contact@haritahive.com</a></p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="text-align: center; color: #9ca3af; font-size: 14px;">
            Harita Hive - Unlock the Power of Geospatial Intelligence
          </p>
        </div>
      `,
    });

    // Send notification email to the team
    const teamEmailResponse = await resend.emails.send({
      from: "Harita Hive <contact@haritahive.com>",
      to: ["contact@haritahive.com"],
      subject: "New Corporate Training Inquiry",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #dc2626;">New Corporate Training Inquiry</h1>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
            <h3 style="color: #374151; margin-top: 0;">Inquiry Details:</h3>
            <ul style="color: #6b7280;">
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Organization:</strong> ${organization}</li>
              <li><strong>Team Size:</strong> ${teamSize}</li>
              <li><strong>Areas of Interest:</strong> ${areasOfInterest.join(", ")}</li>
              ${additionalInfo ? `<li><strong>Additional Information:</strong> ${additionalInfo}</li>` : ""}
            </ul>
          </div>
          
          <p style="color: #dc2626; font-weight: bold;">Please follow up within 24 hours!</p>
        </div>
      `,
    });

    console.log("User email sent:", userEmailResponse);
    console.log("Team email sent:", teamEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Inquiry submitted successfully",
        userEmail: userEmailResponse,
        teamEmail: teamEmailResponse 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-corporate-inquiry-email function:", error);
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