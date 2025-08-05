import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketplaceRequest {
  action: 'browse' | 'purchase' | 'download' | 'upload' | 'search';
  category?: string;
  search_query?: string;
  item_id?: string;
  user_id?: string;
  purchase_data?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, category, search_query, item_id, user_id, purchase_data }: MarketplaceRequest = await req.json();

    console.log(`Marketplace action: ${action}`, { category, search_query, item_id, user_id });

    switch (action) {
      case 'browse':
        return await handleBrowse(supabaseClient, category, search_query);
      case 'purchase':
        return await handlePurchase(supabaseClient, item_id!, user_id!, purchase_data);
      case 'download':
        return await handleDownload(supabaseClient, item_id!, user_id!);
      case 'upload':
        return await handleUpload(supabaseClient, purchase_data, user_id!);
      case 'search':
        return await handleSearch(supabaseClient, search_query!);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in marketplace function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleBrowse(supabase: any, category?: string, search_query?: string) {
  let query = supabase
    .from('marketplace_items')
    .select('*')
    .eq('status', 'active')
    .order('is_featured', { ascending: false })
    .order('rating', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (search_query) {
    query = query.or(`name.ilike.%${search_query}%,description.ilike.%${search_query}%`);
  }

  const { data: items, error } = await query.limit(50);

  if (error) {
    throw new Error(`Failed to browse items: ${error.message}`);
  }

  return new Response(JSON.stringify({ items }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handlePurchase(supabase: any, item_id: string, user_id: string, purchase_data: any) {
  // Get item details
  const { data: item, error: itemError } = await supabase
    .from('marketplace_items')
    .select('*')
    .eq('id', item_id)
    .eq('status', 'active')
    .single();

  if (itemError || !item) {
    throw new Error('Item not found or inactive');
  }

  // Check if user already owns this item
  const { data: existingPurchase } = await supabase
    .from('marketplace_purchases')
    .select('id')
    .eq('user_id', user_id)
    .eq('item_id', item_id)
    .eq('status', 'completed')
    .single();

  if (existingPurchase) {
    return new Response(JSON.stringify({ error: 'Item already purchased' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (item.is_free) {
    // Free item - directly create completed purchase
    const { data: purchase, error: purchaseError } = await supabase
      .from('marketplace_purchases')
      .insert({
        user_id,
        item_id,
        amount: 0,
        currency: item.currency,
        status: 'completed',
        download_url: item.download_url
      })
      .select()
      .single();

    if (purchaseError) {
      throw new Error(`Failed to create purchase: ${purchaseError.message}`);
    }

    // Update download count
    await supabase
      .from('marketplace_items')
      .update({ download_count: item.download_count + 1 })
      .eq('id', item_id);

    return new Response(JSON.stringify({ 
      success: true, 
      purchase,
      download_url: item.download_url 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Paid item - handle credits or payment
  if (item.currency === 'credits') {
    // Check user credits
    const { data: credits, error: creditsError } = await supabase
      .rpc('get_user_credits', { p_user_id: user_id });

    if (creditsError || credits < item.price) {
      return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Deduct credits
    const creditsUpdated = await supabase
      .rpc('update_user_credits', {
        p_user_id: user_id,
        p_amount: -item.price,
        p_transaction_type: 'marketplace_purchase',
        p_description: `Purchased ${item.name}`,
        p_reference_id: item_id
      });

    if (!creditsUpdated.data) {
      throw new Error('Failed to deduct credits');
    }
  }

  // Create purchase record
  const { data: purchase, error: purchaseError } = await supabase
    .from('marketplace_purchases')
    .insert({
      user_id,
      item_id,
      amount: item.price,
      currency: item.currency,
      payment_method: item.currency === 'credits' ? 'credits' : 'stripe',
      status: 'completed',
      download_url: item.download_url
    })
    .select()
    .single();

  if (purchaseError) {
    throw new Error(`Failed to create purchase: ${purchaseError.message}`);
  }

  // Update item counts
  await supabase
    .from('marketplace_items')
    .update({ 
      purchase_count: item.purchase_count + 1,
      download_count: item.download_count + 1 
    })
    .eq('id', item_id);

  return new Response(JSON.stringify({ 
    success: true, 
    purchase,
    download_url: item.download_url 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleDownload(supabase: any, item_id: string, user_id: string) {
  // Verify user owns the item
  const { data: purchase, error } = await supabase
    .from('marketplace_purchases')
    .select('download_url, item_id, marketplace_items!inner(*)')
    .eq('user_id', user_id)
    .eq('item_id', item_id)
    .eq('status', 'completed')
    .single();

  if (error || !purchase) {
    return new Response(JSON.stringify({ error: 'Purchase not found or access denied' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ 
    download_url: purchase.download_url,
    item: purchase.marketplace_items
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpload(supabase: any, item_data: any, user_id: string) {
  const { data: item, error } = await supabase
    .from('marketplace_items')
    .insert({
      ...item_data,
      provider_id: user_id,
      status: 'pending_review'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to upload item: ${error.message}`);
  }

  return new Response(JSON.stringify({ success: true, item }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleSearch(supabase: any, search_query: string) {
  const { data: items, error } = await supabase
    .from('marketplace_items')
    .select('*')
    .eq('status', 'active')
    .or(`name.ilike.%${search_query}%,description.ilike.%${search_query}%,tags.cs.["${search_query}"]`)
    .order('rating', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  return new Response(JSON.stringify({ items }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}