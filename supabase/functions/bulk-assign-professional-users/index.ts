import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      // Professional emails list from the PDF
      const professionalEmails = [
        'bhumip107@gmail.com',
        'kondojukushi10@gmail.com',
        'adityapipil35@gmail.com',
        'mukherjeejayita14@gmail.com',
        'Tanishkatyagi7500@gmail.com',
        'kamakshiiit@gmail.com',
        'Nareshkumar.tamada@gmail.com',
        'Geospatialshekhar@gmail.com',
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
        'udaypbrn@gmail.com'
      ];

      console.log(`Starting bulk assignment for ${professionalEmails.length} professional users`);

      // Also handle explicit revocations
      const revokeEmails = [
        'kaverinayar2005@gmail.com'
      ];

      // Fetch users from profiles by email
      const targetEmails = [...new Set([...professionalEmails.map(e => e.toLowerCase()), ...revokeEmails.map(e => e.toLowerCase())])];
      const { data: profiles, error: profilesError } = await supabaseClient
        .from('profiles')
        .select('id, email')
        .in('email', targetEmails);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return new Response(
          JSON.stringify({ success: false, error: profilesError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const emailToId = new Map((profiles || []).map(p => [p.email.toLowerCase(), p.id]));
      const proUserIds = professionalEmails
        .map(e => emailToId.get(e.toLowerCase()))
        .filter(Boolean);
      const revokeUserIds = revokeEmails
        .map(e => emailToId.get(e.toLowerCase()))
        .filter(Boolean);

      console.log('Users found for pro assignment:', proUserIds.length, 'revocations:', revokeUserIds.length);

      // Upsert Professional subscriptions with lock
      if (proUserIds.length > 0) {
        const upsertRows = proUserIds.map((id: string) => ({
          user_id: id,
          subscription_tier: 'pro',
          status: 'active',
          plan_locked: true,
          updated_at: new Date().toISOString(),
        }));
        const { error: upsertError } = await supabaseClient
          .from('user_subscriptions')
          .upsert(upsertRows, { onConflict: 'user_id' });
        if (upsertError) {
          console.error('Error upserting pro subscriptions:', upsertError);
          return new Response(
            JSON.stringify({ success: false, error: upsertError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update profiles plan to professional
        const { error: proProfileError } = await supabaseClient
          .from('profiles')
          .update({ plan: 'professional', updated_at: new Date().toISOString() })
          .in('id', proUserIds as string[]);
        if (proProfileError) {
          console.error('Error updating professional profiles:', proProfileError);
        }
      }

      // Revoke Professional access -> set to free and lock
      if (revokeUserIds.length > 0) {
        const { error: revokeError } = await supabaseClient
          .from('user_subscriptions')
          .upsert(
            revokeUserIds.map((id: string) => ({
              user_id: id,
              subscription_tier: 'free',
              status: 'active',
              plan_locked: true,
              updated_at: new Date().toISOString(),
            })),
            { onConflict: 'user_id' }
          );
        if (revokeError) {
          console.error('Error revoking subscriptions:', revokeError);
          return new Response(
            JSON.stringify({ success: false, error: revokeError.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: revokeProfileError } = await supabaseClient
          .from('profiles')
          .update({ plan: 'free', updated_at: new Date().toISOString() })
          .in('id', revokeUserIds as string[]);
        if (revokeProfileError) {
          console.error('Error updating revoked profiles:', revokeProfileError);
        }
      }

      console.log('Bulk assignment completed.');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Professional access assigned and locked; revocations processed',
          pro_assigned_count: (proUserIds as string[]).length,
          revoked_count: (revokeUserIds as string[]).length,
          missing_emails: targetEmails.filter(e => !emailToId.has(e)),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in bulk-assign-professional-users function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);