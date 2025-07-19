import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, email, phone, courseTitle, experienceLevel, motivation, referralSource } = await req.json();

    await resend.emails.send({
      from: "HaritaHive <contact@haritahive.com>",
      to: [email],
      subject: `Welcome to ${courseTitle} Waitlist!`,
      html: `
        <h1>Welcome to HaritaHive!</h1>
        <p>Hi ${fullName}, thank you for joining the waitlist for ${courseTitle}.</p>
        <p>We'll notify you as soon as enrollment opens with priority access to early bird pricing.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);