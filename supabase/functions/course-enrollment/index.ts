import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnrollmentRequest {
  courseId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  location: string;
  howDidYouHear?: string;
  isInternational: boolean;
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
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
      fullName,
      email,
      mobileNumber,
      location,
      howDidYouHear,
      isInternational
    }: EnrollmentRequest = await req.json();

    // Check if enrollment deadline has passed (July 21, 7 PM IST)
    const enrollmentDeadline = new Date('2025-07-21T13:30:00.000Z'); // 7 PM IST in UTC
    const currentTime = new Date();
    
    if (currentTime > enrollmentDeadline) {
      return new Response(JSON.stringify({ error: "Enrollment deadline has passed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine pricing
    const paymentAmount = isInternational ? 150 : 11999;
    const paymentCurrency = isInternational ? "USD" : "INR";

    // Create enrollment record
    const { data: enrollmentData, error: enrollmentError } = await supabaseClient
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        full_name: fullName,
        email: email,
        mobile_number: mobileNumber,
        location: location,
        how_did_you_hear: howDidYouHear,
        payment_amount: paymentAmount,
        payment_currency: paymentCurrency,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (enrollmentError) {
      console.error('Enrollment error:', enrollmentError);
      return new Response(JSON.stringify({ error: "Failed to create enrollment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send confirmation email
    try {
      await resend.emails.send({
        from: "contact@haritahive.com",
        to: [email],
        subject: "Enrollment Confirmed: Geospatial Technology Unlocked",
        html: `
          <h1>Welcome to Geospatial Technology Unlocked!</h1>
          <p>Dear ${fullName},</p>
          <p>Thank you for enrolling in our Geospatial Technology Unlocked course. Your enrollment has been confirmed.</p>
          
          <h2>Course Details:</h2>
          <ul>
            <li><strong>Course:</strong> Geospatial Technology Unlocked</li>
            <li><strong>Fee:</strong> ${paymentCurrency} ${paymentAmount}</li>
            <li><strong>Start Date:</strong> 21st July, 8:00 PM IST</li>
            <li><strong>Duration:</strong> 90 days</li>
          </ul>
          
          <h2>Next Steps:</h2>
          <ol>
            <li>Complete your payment via Razorpay</li>
            <li>You will receive course access details via email</li>
            <li>Join our course community channel</li>
          </ol>
          
          <p>We're excited to have you on this journey to master GIS, Remote Sensing, Python, SQL, and GeoAI!</p>
          
          <p>Best regards,<br>The Harita Hive Team</p>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Don't fail the enrollment if email fails
    }

    // Update user's enrolled courses tracking
    try {
      const { error: profileError } = await supabaseAdmin
        .rpc('update_user_enrolled_courses', {
          p_user_id: user.id,
          p_course_title: 'Geospatial Technology Unlocked'
        });
      
      if (profileError) {
        console.error('Failed to update user enrolled courses:', profileError);
        // Don't fail the enrollment if profile update fails
      }
    } catch (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError);
      // Don't fail the enrollment if profile update fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      enrollmentId: enrollmentData.id,
      nextStep: "payment"
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Enrollment function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});