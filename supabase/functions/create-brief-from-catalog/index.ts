import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { product_id, user_id, contact_email, contact_name } = await req.json();

    if (!product_id) {
      throw new Error("Product ID is required");
    }

    console.log(`Creating brief for catalog purchase: ${product_id}`);

    // Get product details to prefill brief
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    // Extract tools and timeline from product
    const tools = product.tags?.filter((tag: string) => 
      ['HubSpot', 'Salesforce', 'Stripe', 'Notion', 'Zapier', 'Google Analytics'].includes(tag)
    ) || [];

    // Create structured brief from product data
    const structuredBrief = {
      goal: {
        interpreted: product.title,
        original: product.title
      },
      context: {
        interpreted: product.description,
        original: product.description
      },
      constraints: {
        interpreted: `Deliverables: ${product.deliverables}`,
        original: `Based on ${product.title} outcome pack`
      },
      budget_range: `£${Math.floor(product.base_price/100)}-${Math.floor(product.base_price/100 * 1.5)}`,
      timeline_default: product.timeline,
      success_metric: `Successful delivery of all ${product.title} deliverables`,
      tools_specified: tools
    };

    // Create brief
    const { data: brief, error: briefError } = await supabase
      .from("briefs")
      .insert({
        origin: 'catalog',
        origin_id: product_id,
        status: 'submitted',
        user_id: user_id || null,
        contact_email: contact_email || 'catalog@example.com',
        contact_name: contact_name || 'Catalog Customer',
        structured_brief: structuredBrief
      })
      .select()
      .single();

    if (briefError) {
      console.error("Error creating brief:", briefError);
      throw new Error("Failed to create brief");
    }

    console.log(`Brief created successfully: ${brief.id}`);

    // Log the event
    await supabase.from('brief_events').insert({
      brief_id: brief.id,
      type: 'brief_created_from_catalog',
      payload: { 
        product_id,
        product_title: product.title,
        auto_generated: true
      }
    });

    return new Response(JSON.stringify({
      status: "success",
      brief_id: brief.id,
      message: "Brief created from catalog purchase"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in create-brief-from-catalog:", error);
    
    return new Response(JSON.stringify({
      status: "error",
      message: error.message || "Failed to create brief"
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});