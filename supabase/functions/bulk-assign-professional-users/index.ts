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

      const { data, error } = await supabaseClient.rpc('bulk_assign_professional_access', {
        email_list: professionalEmails
      });

      if (error) {
        console.error('Bulk assign error:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Bulk assignment completed:', data);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Professional access assigned to all eligible users',
          ...data
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