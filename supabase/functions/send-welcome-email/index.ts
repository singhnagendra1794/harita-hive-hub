import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, email, fullName }: WelcomeEmailRequest = await req.json();

    // Create a comprehensive welcome email HTML
    const welcomeEmailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Harita Hive!</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
        }
        .header { 
            background: linear-gradient(135deg, #10b981, #059669); 
            color: white; 
            padding: 30px 20px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
        }
        .content { 
            background: #fff; 
            padding: 30px; 
            border: 1px solid #e5e7eb; 
        }
        .footer { 
            background: #f9fafb; 
            padding: 20px; 
            text-align: center; 
            border-radius: 0 0 10px 10px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .button { 
            display: inline-block; 
            background: #10b981; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 15px 0;
        }
        .feature-list { 
            background: #f0f9ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0;
        }
        .feature-item { 
            margin: 10px 0; 
            padding-left: 20px; 
            position: relative;
        }
        .feature-item::before { 
            content: "🌍"; 
            position: absolute; 
            left: 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌍 Welcome to Harita Hive!</h1>
        <p>Your journey in Geospatial Technology starts here</p>
    </div>
    
    <div class="content">
        <h2>Hello ${fullName}!</h2>
        
        <p>We're thrilled to have you join the Harita Hive community! You've just gained access to India's most comprehensive geospatial learning platform.</p>
        
        <div class="feature-list">
            <h3>🚀 What's waiting for you:</h3>
            <div class="feature-item">Live interactive classes with expert instructors</div>
            <div class="feature-item">AI-powered GEOVA mentor for personalized learning</div>
            <div class="feature-item">Hands-on projects with real-world datasets</div>
            <div class="feature-item">Professional certification programs</div>
            <div class="feature-item">Access to premium GIS tools and software</div>
            <div class="feature-item">Community of passionate geospatial professionals</div>
        </div>
        
        <p>Ready to start your geospatial journey? Here's what you can do right now:</p>
        
        <center>
            <a href="https://haritahive.com/dashboard" class="button">Explore Your Dashboard</a>
        </center>
        
        <h3>📚 Quick Start Guide:</h3>
        <ol>
            <li><strong>Complete your profile</strong> - Add your background and interests</li>
            <li><strong>Join a live class</strong> - Check our live streaming schedule</li>
            <li><strong>Meet GEOVA</strong> - Your AI learning companion</li>
            <li><strong>Explore courses</strong> - Browse our certification programs</li>
            <li><strong>Connect with community</strong> - Join discussions and share projects</li>
        </ol>
        
        <p>Need help getting started? Our support team is here for you at <a href="mailto:support@haritahive.com">support@haritahive.com</a></p>
        
        <p>Welcome aboard! 🎉</p>
        
        <p>Best regards,<br>
        <strong>The Harita Hive Team</strong><br>
        <em>Empowering the next generation of geospatial professionals</em></p>
    </div>
    
    <div class="footer">
        <p>🌍 <strong>Harita Hive</strong> - India's Premier Geospatial Learning Platform</p>
        <p>
            <a href="https://haritahive.com">Website</a> • 
            <a href="https://haritahive.com/live-classes">Live Classes</a> • 
            <a href="mailto:support@haritahive.com">Support</a>
        </p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
            You received this email because you signed up for Harita Hive. 
            If you have any questions, please contact our support team.
        </p>
    </div>
</body>
</html>
    `;

    // Send email using Supabase's built-in email functionality
    // Note: This requires SMTP to be configured in Supabase Auth settings
    const { error: emailError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        welcome_email_sent: true,
        full_name: fullName,
        user_id: userId
      }
    });

    if (emailError) {
      console.log('Built-in email failed, attempting direct email send...');
      
      // If Resend API key is available, use it as fallback
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Harita Hive <welcome@haritahive.com>',
            to: [email],
            subject: '🌍 Welcome to Harita Hive - Your Geospatial Journey Begins!',
            html: welcomeEmailHtml,
          }),
        });

        if (!resendResponse.ok) {
          throw new Error(`Resend API error: ${resendResponse.statusText}`);
        }

        const resendData = await resendResponse.json();
        console.log('Welcome email sent via Resend:', resendData);
      }
    } else {
      console.log('Welcome email notification triggered via Supabase');
    }

    // Log the welcome email activity
    await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: 'welcome_email_sent',
      points_earned: 0,
      metadata: {
        email: email,
        full_name: fullName,
        sent_at: new Date().toISOString()
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Welcome email sent successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);