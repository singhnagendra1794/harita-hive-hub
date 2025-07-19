import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistRequest {
  courseId: string;
  courseTitle: string;
  fullName: string;
  email: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      courseId,
      courseTitle,
      fullName,
      email
    }: WaitlistRequest = await req.json();

    // Check if user is already on waitlist
    const { data: existingEntry } = await supabaseClient
      .from('course_waitlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingEntry) {
      return new Response(JSON.stringify({ error: "You're already on the waitlist for this course" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create waitlist entry
    const { data: waitlistData, error: waitlistError } = await supabaseClient
      .from('course_waitlist')
      .insert({
        user_id: user.id,
        course_id: courseId,
        full_name: fullName,
        email: email
      })
      .select()
      .single();

    if (waitlistError) {
      console.error('Waitlist error:', waitlistError);
      return new Response(JSON.stringify({ error: "Failed to join waitlist" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: "contact@haritahive.com",
        to: [email],
        subject: `You're on the Waitlist for ${courseTitle}`,
        html: `
          <h1>Welcome to the Waitlist!</h1>
          <p>Dear ${fullName},</p>
          <p>Thank you for your interest in <strong>${courseTitle}</strong>. You have been successfully added to our waitlist.</p>
          
          <h2>What happens next?</h2>
          <ul>
            <li>We'll notify you as soon as enrollment opens for the next cohort</li>
            <li>Waitlist members get priority access and early bird pricing</li>
            <li>You'll receive updates about course content and schedule</li>
          </ul>
          
          <p>In the meantime, feel free to explore our other resources:</p>
          <ul>
            <li>Visit our <a href="https://haritahive.com/blog">blog</a> for the latest GIS insights</li>
            <li>Join our community discussions</li>
            <li>Check out our free learning materials</li>
          </ul>
          
          <p>We appreciate your patience and look forward to having you in our next cohort!</p>
          
          <p>Best regards,<br>The Harita Hive Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the waitlist if email fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Successfully joined waitlist!"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Waitlist function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});