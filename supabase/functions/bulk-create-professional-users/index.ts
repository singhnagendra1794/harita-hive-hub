import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const professionalUsers = [
  { name: 'Bhumika Parmar', email: 'bhumip107@gmail.com' },
  { name: 'Kushi Kondoju', email: 'kondojukushi10@gmail.com' },
  { name: 'Aditya Pipil', email: 'adityapipil35@gmail.com' },
  { name: 'Jayita Mukherjee', email: 'mukherjeejayita14@gmail.com' },
  { name: 'Tanishka Tyagi', email: 'tanishkatyagi7500@gmail.com' },
  { name: 'Kamakshi Rayavarapu', email: 'kamakshiiit@gmail.com' },
  { name: 'Naresh Tamada', email: 'nareshkumar.tamada@gmail.com' },
  { name: 'Chandrashekhar Singh', email: 'geospatialshekhar@gmail.com' },
  { name: 'Priyanka Singh', email: 'ps.priyankasingh26996@gmail.com' },
  { name: 'Madhubala Priya', email: 'madhubalapriya2@gmail.com' },
  { name: 'Moon Moon Das', email: 'munmund66@gmail.com' },
  { name: 'Sujan Sapkota', email: 'sujansapkota27@gmail.com' },
  { name: 'Sanjana A H', email: 'sanjanaharidasan@gmail.com' },
  { name: 'Ajeeth S', email: 'ajays301298@gmail.com' },
  { name: 'Jeevan M P', email: 'jeevanleo2310@gmail.com' },
  { name: 'Gurudatta K. N.', email: 'geoaiguru@gmail.com' },
  { name: 'Mohamed Rashid S', email: 'rashidmsdian@gmail.com' },
  { name: 'Bharath A L', email: 'bharath.viswakarma@gmail.com' },
  { name: 'Shalini Seralathan', email: 'shaliniazh@gmail.com' },
  { name: 'Shaunak Ghosh', email: 'sg17122004@gmail.com' },
  { name: 'Veena AV', email: 'veenapoovukal@gmail.com' },
  { name: 'Asad Ullah', email: 'asadullahm031@gmail.com' },
  { name: 'Moumita Das', email: 'moumitadas19996@gmail.com' },
  { name: 'Javvad Hasan Rizvi', email: 'javvad.rizvi@gmail.com' },
  { name: 'Mandadi Gnana Jyothi', email: 'mandadi.jyothi123@gmail.com' },
  { name: 'Rama Paluri', email: 'udaypbrn@gmail.com' },
  { name: 'Anshuman Avasthi', email: 'anshumanavasthi1411@gmail.com' },
  { name: 'SREESRUTHY M S', email: 'sruthythulasi2017@gmail.com' },
  { name: 'Tharun R', email: 'tharun.ravichandran@gmail.com' },
  { name: 'Ankush Prabhu Rathod', email: 'ankushrathod96@gmail.com' },
  { name: 'Dhiman Kashyap', email: 'dhiman.kashyap24@gmail.com' },
  { name: 'Vandita Ujwal', email: 'vanditaujwal8@gmail.com' },
  { name: 'Nikhil BT', email: 'nikhilbt650@gmail.com' },
  { name: 'Maneet Sethi', email: 'maneetsethi954@gmail.com' },
  { name: 'Nagendra Singh', email: 'nagendrasingh1794@gmail.com' },
  { name: 'Natalia Mejia', email: 'natalia-mejia@live.com' },
  { name: 'Vishwajkumar Baburao Rathod', email: 'vishwajrathod@gmail.com' }
];

const professionalEmails = professionalUsers.map(user => user.email.toLowerCase());

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
      
      for (const user of professionalUsers) {
        try {
          // Create user in auth
          const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
            email: user.email.toLowerCase(),
            email_confirm: false, // They need to set password first
            user_metadata: {
              full_name: user.name,
              plan: 'professional'
            }
          });

          if (authError) {
            console.error(`Failed to create auth user for ${user.email}:`, authError);
            results.push({ email: user.email, name: user.name, success: false, error: authError.message });
            continue;
          }

          // Calculate 3 months from today
          const threeMonthsFromNow = new Date();
          threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

          // Create profile
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authUser.user.id,
            full_name: user.name,
            plan: 'professional',
            course_count: 1, // Starting with 1 course enrolled
            projects_completed: 0,
            community_posts: 0,
            enrolled_courses_count: 1,
            enrolled_courses: ['Geospatial Technology Unlocked']
          });

          if (profileError) {
            console.error(`Failed to create profile for ${user.email}:`, profileError);
          }

          // Create subscription
          const { error: subError } = await supabase.from('user_subscriptions').insert({
            user_id: authUser.user.id,
            subscription_tier: 'pro',
            status: 'active',
            started_at: new Date().toISOString(),
            expires_at: threeMonthsFromNow.toISOString()
          });

          if (subError) {
            console.error(`Failed to create subscription for ${user.email}:`, subError);
          }

          // Create course enrollment
          const { error: enrollmentError } = await supabase.from('course_enrollments').insert({
            user_id: authUser.user.id,
            course_id: null, // Will be set to actual course ID if needed
            enrolled_at: new Date().toISOString(),
            progress_percentage: 0
          });

          if (enrollmentError) {
            console.error(`Failed to create course enrollment for ${user.email}:`, enrollmentError);
          }

          // Create notification preferences
          await supabase.from('notification_preferences').insert({
            user_id: authUser.user.id
          });

          results.push({ email: user.email, name: user.name, success: true, userId: authUser.user.id });
          console.log(`✅ Created user: ${user.name} (${user.email})`);
          
        } catch (error) {
          console.error(`Error creating user ${user.email}:`, error);
          results.push({ email: user.email, name: user.name, success: false, error: error.message });
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