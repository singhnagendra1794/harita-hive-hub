import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are the editor of *Harita Hive Daily* — a friendly, insightful, and expert newsletter about the future of geospatial technology.

Write a concise, high-quality newsletter issue that covers the most important updates, breakthroughs, and tools in geospatial technology worldwide.

Use a clear, conversational tone. Keep it engaging, informative, and easy to read — like a smart tech editor who loves maps and innovation.

Structure your response with these sections:

## 🛰️ Harita Hive Daily — The Future of Geospatial

**Headline & Key Insight**  
Write one short headline about the biggest trend or innovation in geospatial tech today, followed by a 2–3 sentence summary.

**Global News / Updates**  
List 3–5 important news items or announcements (new software versions, satellite launches, acquisitions, policy changes, etc.). Keep each under 2 sentences.

**Tool / Software Spotlight**  
Pick one software (open source or paid) — summarize new updates, features, or how it's useful for professionals.

**Open Source / Community Corner**  
Highlight one new open source project, GitHub repo, or community release that's worth exploring.

**Research & Trends**  
Share 2–3 new research developments, papers, or emerging trends (like GeoAI, digital twins, 3D city modeling, etc.).

**Use Case / Case Study**  
Describe one short real-world example of how geospatial tech is being applied in industries like agriculture, climate, or urban planning.

**Coming Soon / Watchlist**  
List any upcoming conferences, releases, or launches related to geospatial technology.

**Further Reading / Resources**  
Give 2–3 links to whitepapers, tutorials, GitHub projects, or datasets to learn more.

---

End with:  
🗺️ *Curated by Harita Hive — exploring the future of maps, data, and intelligence.*

Guidelines:
- Prioritize recency: use the latest information available.
- Balance open source and commercial updates.
- Keep total length around 400–600 words.
- Use bullet points for easy reading.
- Maintain a friendly, expert tone — never robotic or corporate.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { autoSave = false, userId } = await req.json();
    const todayDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    console.log('Generating daily newsletter for:', todayDate);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Generate today's Harita Hive Daily newsletter for ${todayDate}. Focus on real, current developments in geospatial technology.` }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    const newsletterContent = data.choices[0].message.content;

    // Auto-save to database if requested
    if (autoSave && userId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const title = `Harita Hive Daily — ${todayDate}`;
      
      const { error: insertError } = await supabase
        .from('newsletter_posts')
        .insert({
          user_id: userId,
          title: title,
          content: newsletterContent,
          tags: ['Daily Newsletter', 'GeoAI', 'Geospatial Tech', 'Innovation'],
          published_date: new Date().toISOString().split('T')[0],
          cover_image_url: null
        });

      if (insertError) {
        console.error('Error saving newsletter:', insertError);
      } else {
        console.log('Newsletter saved successfully');
      }
    }

    return new Response(
      JSON.stringify({ 
        content: newsletterContent,
        title: `Harita Hive Daily — ${todayDate}`,
        date: todayDate
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-daily-newsletter function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
