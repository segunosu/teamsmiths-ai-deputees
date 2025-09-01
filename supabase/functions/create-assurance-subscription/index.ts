import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ASSURANCE-SUBSCRIPTION] ${step}${detailsStr}`);
};

const ASSURANCE_PRICES = {
  bronze: 19900, // £199.00 in pence
  silver: 39900, // £399.00 in pence
  gold: 69900,   // £699.00 in pence
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const { project_id, assurance_plan, user_id } = await req.json();
    logStep("Request body parsed", { project_id, assurance_plan, user_id });

    if (!ASSURANCE_PRICES[assurance_plan as keyof typeof ASSURANCE_PRICES]) {
      throw new Error(`Invalid assurance plan: ${assurance_plan}`);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Get user profile for Stripe customer
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile?.email) {
      throw new Error("User profile not found");
    }

    logStep("User profile retrieved", { email: profile.email });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ 
      email: profile.email, 
      limit: 1 
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name,
        metadata: {
          user_id: user_id,
        },
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Get project details
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('title')
      .eq('id', project_id)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found");
    }

    const planPrice = ASSURANCE_PRICES[assurance_plan as keyof typeof ASSURANCE_PRICES];
    const planName = assurance_plan.charAt(0).toUpperCase() + assurance_plan.slice(1);

    // Create Stripe subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `${planName} Assurance - ${project.title}`,
              description: `${planName} performance assurance for project: ${project.title}`,
            },
            unit_amount: planPrice,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/projects/${project_id}?assurance=success`,
      cancel_url: `${req.headers.get("origin")}/projects/${project_id}?assurance=cancelled`,
      metadata: {
        project_id: project_id,
        assurance_plan: assurance_plan,
        user_id: user_id,
      },
    });

    logStep("Stripe checkout session created", { 
      sessionId: session.id, 
      url: session.url 
    });

    return new Response(JSON.stringify({ 
      url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});