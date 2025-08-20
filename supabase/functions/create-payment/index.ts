// Supabase Edge Function: create-payment (one-off)
// Creates a Stripe Checkout session for a specific product (Outcome Pack)
// Returns a URL to redirect the user to Stripe Checkout

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Supabase client using anon key for user authentication context and reads
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: Stripe secret key not configured");
      throw new Error("Payment system not configured. Please contact support.");
    }
    logStep("Stripe key verified");

    // Parse body early for validation
    const body = await req.json().catch(() => {
      logStep("ERROR: Invalid JSON body");
      throw new Error("Invalid request format");
    });
    
    const productId: string | undefined = body?.product_id;
    const guestEmail: string | undefined = body?.email;
    
    if (!productId) {
      logStep("ERROR: Missing product_id");
      throw new Error("Product ID is required");
    }
    logStep("Request validated", { productId, hasGuestEmail: !!guestEmail });

    // Handle authentication (optional for guest checkout)
    let user = null;
    let customerEmail = guestEmail;
    
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
      if (!userError && userData.user?.email) {
        user = userData.user;
        customerEmail = user.email;
        logStep("User authenticated", { userId: user.id, email: user.email });
      }
    }

    if (!customerEmail) {
      logStep("ERROR: No email available");
      throw new Error("Email is required for checkout");
    }

    // Fetch product details (products are publicly viewable when is_active = true)
    const { data: product, error: productError } = await supabaseAnon
      .from("products")
      .select("id, title, base_price, stripe_price_id")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError) {
      logStep("ERROR: Product query failed", { error: productError.message });
      throw new Error("Failed to find product");
    }
    if (!product) {
      logStep("ERROR: Product not found or inactive");
      throw new Error("Product not found or unavailable");
    }
    logStep("Product found", { title: product.title, price: product.base_price, hasPriceId: !!product.stripe_price_id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find or create Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    const customerId = customers.data[0]?.id;
    logStep("Customer lookup", { customerId, email: customerEmail });

    const origin = req.headers.get("origin") || "https://iyqsbjawaampgcavsgcz.supabase.co";

    // Create checkout session - prefer Stripe Price ID if available
    let sessionData: any = {
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-canceled`,
      allow_promotion_codes: true,
      metadata: {
        product_id: product.id,
        product_title: product.title,
        user_id: user?.id || "guest",
      },
    };

    if (product.stripe_price_id) {
      // Use Stripe Price ID (recommended)
      sessionData.line_items = [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ];
      logStep("Using Stripe Price ID", { priceId: product.stripe_price_id });
    } else {
      // Fallback to price_data
      const unitAmount = Number(product.base_price);
      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        logStep("ERROR: Invalid product price", { basePrice: product.base_price });
        throw new Error("Product price is invalid");
      }
      
      sessionData.line_items = [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: product.title },
            unit_amount: unitAmount, // Already in pence from DB
          },
          quantity: 1,
        },
      ];
      logStep("Using price_data fallback", { unitAmount });
    }

    const session = await stripe.checkout.sessions.create(sessionData);
    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ ok: true, url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    const stack = (error as any)?.stack;
    
    logStep("ERROR in create-payment", { message, stack });
    
    return new Response(JSON.stringify({ 
      ok: false, 
      error: message,
      code: 'PAYMENT_ERROR'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
