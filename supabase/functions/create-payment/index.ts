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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("Stripe secret key not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const token = authHeader.replace("Bearer ", "");

    // Get current user
    const { data: userData, error: userError } = await supabaseAnon.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User email not available");

    // Parse body
    const body = await req.json().catch(() => ({}));
    const productId: string | undefined = body?.product_id;
    if (!productId) throw new Error("product_id is required");

    // Fetch product details (products are publicly viewable when is_active = true)
    const { data: product, error: productError } = await supabaseAnon
      .from("products")
      .select("id, title, base_price")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError) throw new Error(`Product error: ${productError.message}`);
    if (!product) throw new Error("Product not found or inactive");

    // base_price is stored in minor units (pence), Catalog divides by 100 for display
    const unitAmount = Number(product.base_price);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new Error("Invalid product price");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Ensure a Stripe customer exists (idempotent by email)
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    const customerId = customers.data[0]?.id;

    const origin = req.headers.get("origin") || "https://iyqsbjawaampgcavsgcz.supabase.co";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email!,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: product.title },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment-canceled`,
      allow_promotion_codes: true,
      metadata: {
        product_id: product.id,
        product_title: product.title,
        user_id: user.id,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
