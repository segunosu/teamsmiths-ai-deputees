// Supabase Edge Function: verify-payment
// Verifies a Stripe Checkout session and creates a project for the buyer

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Clients: anon for auth context, service for writes
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );
  const supabaseService = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");

    // Validate user
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not found");

    let sessionId = "";
    if (req.method === "GET") {
      const url = new URL(req.url);
      sessionId = url.searchParams.get("session_id") ?? "";
    } else {
      const body = await req.json().catch(() => ({}));
      sessionId = body?.session_id ?? "";
    }
    if (!sessionId) throw new Error("session_id is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const productId = session.metadata?.product_id as string | undefined;
    const productTitle = (session.metadata?.product_title as string | undefined) ?? "Purchased Pack";

    // Check if a project already exists for this session (idempotency)
    const { data: existingOrders } = await supabaseService
      .from("orders")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .eq("user_id", user.id)
      .limit(1);

    if (existingOrders && existingOrders.length > 0) {
      // Find the project for this existing order
      const { data: existingProject } = await supabaseService
        .from("projects")
        .select("id")
        .eq("teamsmith_user_id", user.id)
        .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // within last hour
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingProject) {
        console.log("Returning existing project for session:", sessionId);
        return new Response(
          JSON.stringify({ success: true, project_id: existingProject.id, product_id: productId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }
    }

    // Create a project for the user
    const title = `${productTitle} - ${new Date().toLocaleDateString()}`;
    const total = session.amount_total ?? 0; // minor units (pence)
    const currency = (session.currency || "gbp").toUpperCase();

    const { data: project, error: projectError } = await supabaseService
      .from("projects")
      .insert({
        title,
        total_price: total,
        currency,
        teamsmith_user_id: user.id,
        is_custom: false,
        status: "draft",
      })
      .select("id")
      .single();

    if (projectError) throw new Error(`Project creation failed: ${projectError.message}`);

    // Record the order for idempotency tracking
    await supabaseService.from("orders").insert({
      user_id: user.id,
      stripe_session_id: sessionId,
      amount: total,
      currency: currency.toLowerCase(),
      product_id: productId,
      status: "paid",
    });

    // Add user as participant (idempotent insertion)
    const { error: participantError } = await supabaseService
      .from("project_participants")
      .insert({
        project_id: project.id,
        user_id: user.id,
        role: "client",
      })
      .select()
      .maybeSingle();

    if (participantError) {
      console.error("Failed to add participant:", participantError);
    }

    return new Response(
      JSON.stringify({ success: true, project_id: project.id, product_id: productId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
