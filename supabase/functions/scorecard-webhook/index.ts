import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "list";

    // GET: Fetch scorecard leads (for CRM to pull)
    if (req.method === "GET") {
      let query = supabaseClient
        .from("scorecard_responses")
        .select("*");

      // Filter by date range
      const since = url.searchParams.get("since");
      if (since) {
        query = query.gte("created_at", since);
      }

      // Filter by segment
      const segment = url.searchParams.get("segment");
      if (segment) {
        query = query.eq("segment", segment);
      }

      // Filter by CRM status
      const status = url.searchParams.get("status");
      if (status) {
        query = query.eq("crm_lead_status", status);
      }

      // Limit
      const limit = parseInt(url.searchParams.get("limit") || "100");
      query = query.limit(limit);

      // Order by newest first
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return new Response(
        JSON.stringify({ 
          success: true, 
          count: data?.length || 0,
          leads: data 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST: Update lead status (for CRM to push updates)
    if (req.method === "POST") {
      const body = await req.json();
      const { lead_id, updates } = body;

      if (!lead_id) {
        throw new Error("lead_id is required");
      }

      // Allowed fields to update
      const allowedFields = [
        "crm_lead_status",
        "last_contacted_at", 
        "booked_session",
        "converted_to_project",
        "notes",
        "crm_synced_at"
      ];

      const updateData: any = {};
      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          updateData[field] = updates[field];
        }
      }

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabaseClient
        .from("scorecard_responses")
        .update(updateData)
        .eq("id", lead_id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, lead: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // PUT: Bulk update (for syncing multiple leads)
    if (req.method === "PUT") {
      const body = await req.json();
      const { updates } = body;

      if (!Array.isArray(updates)) {
        throw new Error("updates must be an array");
      }

      const results = [];
      for (const update of updates) {
        const { lead_id, ...fields } = update;
        
        const { data, error } = await supabaseClient
          .from("scorecard_responses")
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq("id", lead_id)
          .select()
          .single();

        results.push({ lead_id, success: !error, data, error: error?.message });
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
