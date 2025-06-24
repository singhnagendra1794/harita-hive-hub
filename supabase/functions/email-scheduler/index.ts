
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  console.log('Email scheduler called');

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const now = new Date().toISOString();
    
    // Get pending emails that are scheduled to be sent
    const { data: pendingEmails, error } = await supabase
      .from('email_queue')
      .select(`
        *,
        email_templates(name, subject, html_content, text_content)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(50);

    if (error) {
      throw error;
    }

    console.log(`Found ${pendingEmails?.length || 0} emails to process`);

    let processed = 0;
    let failed = 0;

    for (const email of pendingEmails || []) {
      try {
        // Get user details
        const { data: user } = await supabase.auth.admin.getUserById(email.user_id);
        
        if (!user.user) {
          console.log(`User not found for email ${email.id}`);
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed', 
              error_message: 'User not found',
              sent_at: now 
            })
            .eq('id', email.id);
          failed++;
          continue;
        }

        // Prepare template data
        const templateData = {
          user_name: user.user.user_metadata?.full_name || user.user.email?.split('@')[0] || 'there',
          dashboard_url: `${supabaseUrl.replace('//', '//app.')}/dashboard`,
          live_classes_url: `${supabaseUrl.replace('//', '//app.')}/live-classes`,
          ...(email.email_data || {})
        };

        // Call send-email function
        const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            template_name: email.email_templates.name,
            recipient_email: email.recipient_email,
            user_id: email.user_id,
            template_data: templateData
          })
        });

        const sendResult = await sendResponse.json();

        if (sendResult.success) {
          await supabase
            .from('email_queue')
            .update({ 
              status: 'sent', 
              sent_at: now 
            })
            .eq('id', email.id);
          processed++;
          console.log(`Successfully sent email ${email.id}`);
        } else {
          await supabase
            .from('email_queue')
            .update({ 
              status: 'failed', 
              error_message: sendResult.error || sendResult.reason || 'Unknown error',
              sent_at: now 
            })
            .eq('id', email.id);
          failed++;
          console.log(`Failed to send email ${email.id}: ${sendResult.error || sendResult.reason}`);
        }

      } catch (emailError) {
        console.error(`Error processing email ${email.id}:`, emailError);
        await supabase
          .from('email_queue')
          .update({ 
            status: 'failed', 
            error_message: String(emailError),
            sent_at: now 
          })
          .eq('id', email.id);
        failed++;
      }
    }

    // Schedule onboarding emails for users who haven't received them yet
    await scheduleOnboardingEmails();

    console.log(`Email processing complete. Processed: ${processed}, Failed: ${failed}`);

    return new Response(JSON.stringify({ 
      success: true, 
      processed, 
      failed 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in email-scheduler function:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

async function scheduleOnboardingEmails() {
  console.log('Checking for onboarding emails to schedule...');
  
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Find users who signed up in the last day and haven't started onboarding emails
  const { data: newUsers } = await supabase
    .from('user_onboarding')
    .select('*')
    .is('last_email_sent', null)
    .gte('started_at', dayAgo.toISOString());

  for (const onboarding of newUsers || []) {
    // Schedule welcome email immediately
    const { data: welcomeTemplate } = await supabase
      .from('email_templates')
      .select('id')
      .eq('name', 'welcome_email')
      .single();

    if (welcomeTemplate) {
      // Get user email
      const { data: user } = await supabase.auth.admin.getUserById(onboarding.user_id);
      
      if (user.user?.email) {
        await supabase.from('email_queue').insert({
          user_id: onboarding.user_id,
          template_id: welcomeTemplate.id,
          recipient_email: user.user.email,
          scheduled_for: now.toISOString(),
          email_data: {}
        });

        // Schedule day 2 onboarding email
        const { data: day2Template } = await supabase
          .from('email_templates')
          .select('id')
          .eq('name', 'onboarding_day2')
          .single();

        if (day2Template) {
          const day2Date = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
          await supabase.from('email_queue').insert({
            user_id: onboarding.user_id,
            template_id: day2Template.id,
            recipient_email: user.user.email,
            scheduled_for: day2Date.toISOString(),
            email_data: {}
          });
        }

        // Update onboarding tracking
        await supabase
          .from('user_onboarding')
          .update({ 
            last_email_sent: now.toISOString(),
            current_step: 2 
          })
          .eq('user_id', onboarding.user_id);

        console.log(`Scheduled onboarding emails for user ${onboarding.user_id}`);
      }
    }
  }
}

serve(handler);
