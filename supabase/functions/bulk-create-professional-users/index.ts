import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const professionalEmails = [
  'bhumip107@gmail.com',
  'kondojukushi10@gmail.com',
  'adityapipil35@gmail.com',
  'mukherjeejayita14@gmail.com',
  'tanishkatyagi7500@gmail.com',
  'kamakshiiit@gmail.com',
  'nareshkumar.tamada@gmail.com',
  'geospatialshekhar@gmail.com',
  'ps.priyankasingh26996@gmail.com',
  'madhubalapriya2@gmail.com',
  'munmund66@gmail.com',
  'sujansapkota27@gmail.com',
  'sanjanaharidasan@gmail.com',
  'ajays301298@gmail.com',
  'jeevanleo2310@gmail.com',
  'geoaiguru@gmail.com',
  'rashidmsdian@gmail.com',
  'bharath.viswakarma@gmail.com',
  'shaliniazh@gmail.com',
  'sg17122004@gmail.com',
  'veenapoovukal@gmail.com',
  'asadullahm031@gmail.com',
  'moumitadas19996@gmail.com',
  'javvad.rizvi@gmail.com',
  'mandadi.jyothi123@gmail.com',
  'udaypbrn@gmail.com',
  'anshumanavasthi1411@gmail.com',
  'sruthythulasi2017@gmail.com',
  'nagendrasingh1794@gmail.com'
];

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { action } = await req.json();
    
    if (action === 'cleanup') {
      // Step 1: Clean up existing professional users (except super admin)
      console.log('🗑️ Cleaning up existing professional users...');
      
      // Get existing professional users
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      
      for (const user of existingUsers?.users || []) {
        if (user.email && professionalEmails.includes(user.email.toLowerCase()) && 
            user.email !== 'contact@haritahive.com') {
          await supabase.auth.admin.deleteUser(user.id);
          console.log(`Deleted user: ${user.email}`);
        }
      }
      
      // Clean up related data
      await supabase.from('profiles').delete().in('id', existingUsers?.users?.map(u => u.id) || []);
      await supabase.from('user_subscriptions').delete().in('user_id', existingUsers?.users?.map(u => u.id) || []);
      
      return new Response(JSON.stringify({ success: true, message: 'Cleanup completed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'create') {
      // Step 2: Create new professional users
      console.log('🆕 Creating professional users...');
      const results = [];
      
      for (const email of professionalEmails) {
        try {
          // Create user in auth
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: email.toLowerCase(),
            email_confirm: false, // They need to set password first
            user_metadata: {
              full_name: email.split('@')[0], // Use email prefix as default name
              plan: 'professional'
            }
          });

          if (authError) {
            console.error(`Failed to create auth user for ${email}:`, authError);
            results.push({ email, success: false, error: authError.message });
            continue;
          }

          // Create profile
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authUser.user.id,
            full_name: email.split('@')[0],
            plan: 'professional',
            course_count: 0,
            projects_completed: 0,
            community_posts: 0
          });

          if (profileError) {
            console.error(`Failed to create profile for ${email}:`, profileError);
          }

          // Create subscription
          const { error: subError } = await supabase.from('user_subscriptions').insert({
            user_id: authUser.user.id,
            subscription_tier: 'pro',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: null // No expiry for professional users
          });

          if (subError) {
            console.error(`Failed to create subscription for ${email}:`, subError);
          }

          // Create notification preferences
          await supabase.from('notification_preferences').insert({
            user_id: authUser.user.id
          });

          results.push({ email, success: true, userId: authUser.user.id });
          console.log(`✅ Created user: ${email}`);
          
        } catch (error) {
          console.error(`Error creating user ${email}:`, error);
          results.push({ email, success: false, error: error.message });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Created ${results.filter(r => r.success).length} users`,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (action === 'send_emails') {
      // Step 3: Send password setup emails
      console.log('📨 Sending password setup emails...');
      const emailResults = [];
      
      const { data: users } = await supabase.auth.admin.listUsers();
      
      for (const user of users?.users || []) {
        if (user.email && professionalEmails.includes(user.email.toLowerCase())) {
          try {
            // Generate password reset link
            const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
              type: 'recovery',
              email: user.email,
              options: {
                redirectTo: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}.vercel.app/auth/reset-password`
              }
            });

            if (resetError) {
              console.error(`Failed to generate reset link for ${user.email}:`, resetError);
              emailResults.push({ email: user.email, success: false, error: resetError.message });
              continue;
            }

            // Send email via Resend
            const { error: emailError } = await resend.emails.send({
              from: 'Harita Hive <contact@haritahive.com>',
              to: [user.email],
              subject: 'Welcome to Harita Hive - Set Your Password',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Welcome to Harita Hive Professional!</h2>
                  
                  <p>Your professional account has been created successfully. You now have access to:</p>
                  
                  <ul>
                    <li>✅ Full access to Learn section</li>
                    <li>✅ QGIS Project integration</li>
                    <li>✅ GeoAI Lab & Tools</li>
                    <li>✅ Web GIS Builder</li>
                    <li>✅ GIS Marketplace downloads</li>
                    <li>✅ Premium course enrollment</li>
                    <li>✅ Priority support</li>
                  </ul>
                  
                  <p><strong>To get started, please set your password:</strong></p>
                  
                  <a href="${resetData.properties?.action_link}" 
                     style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                    Set Your Password
                  </a>
                  
                  <p style="color: #6b7280; font-size: 14px;">
                    This link will expire in 24 hours. If you have any issues, please contact us at contact@haritahive.com
                  </p>
                  
                  <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
                  
                  <p style="color: #6b7280; font-size: 12px;">
                    Harita Hive - Advanced Geospatial Technology Platform<br>
                    <a href="https://haritahive.com">haritahive.com</a>
                  </p>
                </div>
              `
            });

            if (emailError) {
              console.error(`Failed to send email to ${user.email}:`, emailError);
              emailResults.push({ email: user.email, success: false, error: emailError.message });
            } else {
              emailResults.push({ email: user.email, success: true });
              console.log(`📧 Sent email to: ${user.email}`);
            }
            
          } catch (error) {
            console.error(`Error sending email to ${user.email}:`, error);
            emailResults.push({ email: user.email, success: false, error: error.message });
          }
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: `Sent ${emailResults.filter(r => r.success).length} emails`,
        results: emailResults
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Invalid action', { status: 400, headers: corsHeaders });
    
  } catch (error) {
    console.error('Error in bulk-create-professional-users:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);