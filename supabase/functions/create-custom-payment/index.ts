import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CUSTOM-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Parse request body
    const { milestone_id } = await req.json();
    if (!milestone_id) {
      throw new Error("milestone_id is required");
    }
    logStep("Request parsed", { milestone_id });

    // Initialize Supabase with service role for secure operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user (for client auth)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Fetch milestone details with project and quote info
    const { data: milestone, error: milestoneError } = await supabaseService
      .from('custom_project_milestones')
      .select(`
        *,
        project:projects(
          id,
          title,
          org_id
        ),
        quote:custom_quotes(
          id,
          quote_number,
          project_title,
          user_id
        )
      `)
      .eq('id', milestone_id)
      .single();

    if (milestoneError || !milestone) {
      throw new Error(`Milestone not found: ${milestoneError?.message}`);
    }
    logStep("Milestone fetched", { 
      milestoneId: milestone.id, 
      amount: milestone.amount,
      projectTitle: milestone.project?.title 
    });

    // Verify user has access to this milestone
    if (milestone.quote?.user_id !== user.id) {
      throw new Error("Unauthorized: You don't have access to this milestone");
    }
    logStep("User authorization verified");

    // Check if milestone is ready for payment
    if (milestone.status !== 'pending_approval') {
      throw new Error(`Milestone cannot be paid. Current status: ${milestone.status}`);
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing Stripe customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      });
      customerId = customer.id;
      logStep("New Stripe customer created", { customerId });
    }

    // Create Stripe checkout session for milestone payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${milestone.quote.project_title} - ${milestone.title}`,
              description: `Milestone ${milestone.milestone_number}: ${milestone.description || ''}`,
              images: [],
            },
            unit_amount: milestone.amount, // Amount already in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?milestone=${milestone_id}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?tab=projects`,
      allow_promotion_codes: true,
      metadata: {
        milestone_id: milestone_id,
        project_id: milestone.project?.id || '',
        quote_id: milestone.quote_id || '',
        user_id: user.id,
        type: 'custom_milestone_payment'
      }
    });

    logStep("Stripe checkout session created", { sessionId: session.id, url: session.url });

    // Update milestone with payment intent ID for tracking
    const { error: updateError } = await supabaseService
      .from('custom_project_milestones')
      .update({
        stripe_payment_intent_id: session.payment_intent,
        updated_at: new Date().toISOString()
      })
      .eq('id', milestone_id);

    if (updateError) {
      logStep("Warning: Could not update milestone with payment intent", { error: updateError });
      // Don't fail the request for this
    } else {
      logStep("Milestone updated with payment intent");
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id,
      milestone_title: milestone.title,
      amount: milestone.amount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-custom-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});