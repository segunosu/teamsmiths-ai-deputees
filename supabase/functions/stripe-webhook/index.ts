import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("Missing stripe signature");
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    logStep("Event verified", { type: event.type, id: event.id });

    // Initialize Supabase with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Handle different webhook events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout session completed", { sessionId: session.id });

        const metadata = session.metadata;
        if (!metadata) break;

        if (metadata.type === 'custom_milestone_payment') {
          // Handle custom milestone payment
          const milestoneId = metadata.milestone_id;
          const userId = metadata.user_id;

          // Update milestone status
          const { error: updateError } = await supabaseService
            .from('custom_project_milestones')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString()
            })
            .eq('id', milestoneId);

          if (updateError) {
            logStep("Error updating milestone", { error: updateError });
            break;
          }

          // Get user email for confirmation
          const { data: profile } = await supabaseService
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', userId)
            .single();

          if (profile?.email) {
            // Send payment confirmation email
            await resend.emails.send({
              from: "Platform <onboarding@resend.dev>",
              to: [profile.email],
              subject: "Payment Confirmed - Milestone Approved",
              html: `
                <h2>Payment Confirmed!</h2>
                <p>Hi ${profile.full_name || 'there'},</p>
                <p>Your payment of £${(session.amount_total! / 100).toLocaleString()} has been successfully processed.</p>
                <p>The milestone will now proceed to the next stage of delivery.</p>
                <p>You can track progress in your <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/dashboard">project dashboard</a>.</p>
                <p>Thank you for your business!</p>
              `,
            });
            logStep("Payment confirmation email sent");
          }

        } else if (metadata.product_id) {
          // Handle product purchase - create brief for expert matching workflow
          const productId = metadata.product_id;
          const userId = metadata.user_id;

          // Update order status
          const { error: orderError } = await supabaseService
            .from('orders')
            .update({ status: 'paid' })
            .eq('stripe_session_id', session.id);

          if (orderError) {
            logStep("Error updating order", { error: orderError });
          }

          // Get user profile for brief creation
          const { data: profile } = await supabaseService
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', userId)
            .single();

          // Create brief from catalog purchase (follows expert matching workflow)
          try {
            const { data, error } = await supabaseService.functions.invoke('create-brief-from-catalog', {
              body: { 
                product_id: productId,
                user_id: userId,
                contact_email: profile?.email || session.customer_details?.email,
                contact_name: profile?.full_name || session.customer_details?.name
              }
            });

            if (error) throw error;
            logStep("Brief created from catalog purchase", { briefId: data?.brief_id });

            if (profile?.email) {
              // Send purchase confirmation email
              await resend.emails.send({
                from: "Platform <onboarding@resend.dev>",
                to: [profile.email],
                subject: "Purchase Confirmed - Expert Matching Started",
                html: `
                  <h2>Purchase Confirmed!</h2>
                  <p>Hi ${profile.full_name || 'there'},</p>
                  <p>Your purchase of ${metadata.product_title} for £${(session.amount_total! / 100).toLocaleString()} has been confirmed.</p>
                  <p>We're now matching you with expert freelancers who will submit personalized proposals for your project.</p>
                  <p>You'll be notified when proposals are ready for review in your <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/dashboard">dashboard</a>.</p>
                  <p>This ensures you get the best expert for your specific needs!</p>
                `,
              });
              logStep("Purchase confirmation email sent");
            }
          } catch (error) {
            logStep("Error creating brief from catalog purchase", { error });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Processing payment failed", { piId: paymentIntent.id });

        // Handle failed payment - notify user and admins
        const metadata = paymentIntent.metadata;
        if (metadata?.user_id) {
          const { data: profile } = await supabaseService
            .from('profiles')
            .select('email, full_name')
            .eq('user_id', metadata.user_id)
            .single();

          if (profile?.email) {
            await resend.emails.send({
              from: "Platform <onboarding@resend.dev>",
              to: [profile.email],
              subject: "Payment Failed - Action Required",
              html: `
                <h2>Payment Failed</h2>
                <p>Hi ${profile.full_name || 'there'},</p>
                <p>We were unable to process your payment. This could be due to:</p>
                <ul>
                  <li>Insufficient funds</li>
                  <li>Card declined by bank</li>
                  <li>Incorrect payment details</li>
                </ul>
                <p>Please try again or contact your bank for assistance.</p>
                <p>You can retry payment in your <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/dashboard">dashboard</a>.</p>
              `,
            });
            logStep("Payment failed email sent");
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});