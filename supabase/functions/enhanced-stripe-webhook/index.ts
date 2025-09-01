import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ENHANCED-STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2023-10-16",
    });

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature!,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? ""
      );
    } catch (err) {
      logStep("Webhook signature verification failed", err);
      return new Response(`Webhook signature verification failed`, { status: 400 });
    }

    logStep("Processing event", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabaseClient, event);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(supabaseClient, event);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabaseClient, event);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabaseClient, event);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(supabaseClient, event);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(supabaseClient, event);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(supabaseClient, event);
        break;
      
      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutCompleted(supabase: any, event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  logStep("Handling checkout completed", { sessionId: session.id });

  // Determine if this is a milestone payment or subscription
  const metadata = session.metadata || {};
  
  if (metadata.milestone_id) {
    // Handle milestone payment
    const { error } = await supabase
      .from('milestones')
      .update({
        payment_status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent
      })
      .eq('id', metadata.milestone_id);

    if (!error) {
      // Emit payment succeeded event
      await supabase.functions.invoke('events-dispatch', {
        body: {
          type: metadata.milestone_number === '1' ? 'payment.succeeded.m1' : 'payment.succeeded',
          payload: {
            milestone_id: metadata.milestone_id,
            project_id: metadata.project_id,
            client_user_id: metadata.client_user_id,
            expert_user_id: metadata.expert_user_id,
            milestone_title: metadata.milestone_title,
            amount: session.amount_total || 0,
            project_title: metadata.project_title,
            is_milestone_1: metadata.milestone_number === '1'
          }
        }
      });
    }
  } else if (metadata.assurance_plan) {
    // Handle assurance subscription - will be handled by subscription.created
    logStep("Assurance subscription checkout completed", { plan: metadata.assurance_plan });
  }
}

async function handlePaymentSucceeded(supabase: any, event: Stripe.Event) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  logStep("Handling payment succeeded", { paymentIntentId: paymentIntent.id });

  // Find milestone by payment intent ID
  const { data: milestone } = await supabase
    .from('milestones')
    .select(`
      id,
      title,
      amount,
      milestone_number,
      project_id,
      projects (
        title,
        teamsmith_user_id,
        project_participants (
          user_id,
          role
        )
      )
    `)
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (milestone) {
    const project = milestone.projects;
    const expert = project.project_participants.find((p: any) => p.role === 'expert');
    
    // Emit payment event
    await supabase.functions.invoke('events-dispatch', {
      body: {
        type: milestone.milestone_number === 1 ? 'payment.succeeded.m1' : 'payment.succeeded',
        payload: {
          milestone_id: milestone.id,
          project_id: milestone.project_id,
          client_user_id: project.teamsmith_user_id,
          expert_user_id: expert?.user_id,
          milestone_title: milestone.title,
          amount: milestone.amount,
          project_title: project.title,
          is_milestone_1: milestone.milestone_number === 1
        }
      }
    });
  }
}

async function handleSubscriptionCreated(supabase: any, event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  logStep("Handling subscription created", { subscriptionId: subscription.id });

  const metadata = subscription.metadata || {};
  
  if (metadata.project_id) {
    // Update project with assurance plan
    const { error } = await supabase
      .from('projects')
      .update({
        assurance_active: true,
        assurance_plan: metadata.assurance_plan,
        assurance_subscription_id: subscription.id,
        assurance_activated_at: new Date().toISOString()
      })
      .eq('id', metadata.project_id);

    if (!error) {
      // Emit retainer activated event
      await supabase.functions.invoke('events-dispatch', {
        body: {
          type: 'retainer.activated',
          payload: {
            project_id: metadata.project_id,
            user_id: metadata.user_id,
            assurance_plan: metadata.assurance_plan,
            subscription_id: subscription.id
          }
        }
      });
    }
  }
}

async function handleSubscriptionUpdated(supabase: any, event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  logStep("Handling subscription updated", { subscriptionId: subscription.id });

  // Find project by subscription ID
  const { data: project } = await supabase
    .from('projects')
    .select('id, assurance_plan')
    .eq('assurance_subscription_id', subscription.id)
    .single();

  if (project) {
    if (subscription.status === 'active') {
      await supabase
        .from('projects')
        .update({ assurance_active: true })
        .eq('id', project.id);
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      await supabase
        .from('projects')
        .update({ assurance_active: false })
        .eq('id', project.id);
    }
  }
}

async function handleSubscriptionCancelled(supabase: any, event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  logStep("Handling subscription cancelled", { subscriptionId: subscription.id });

  // Find project by subscription ID
  const { data: project } = await supabase
    .from('projects')
    .select('id, teamsmith_user_id, title, assurance_plan')
    .eq('assurance_subscription_id', subscription.id)
    .single();

  if (project) {
    // Deactivate assurance
    await supabase
      .from('projects')
      .update({
        assurance_active: false,
        assurance_cancelled_at: new Date().toISOString()
      })
      .eq('id', project.id);

    // Emit retainer cancelled event
    await supabase.functions.invoke('events-dispatch', {
      body: {
        type: 'retainer.cancelled',
        payload: {
          project_id: project.id,
          user_id: project.teamsmith_user_id,
          project_title: project.title,
          assurance_plan: project.assurance_plan
        }
      }
    });
  }
}

async function handleInvoicePaymentSucceeded(supabase: any, event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  logStep("Handling invoice payment succeeded", { invoiceId: invoice.id });
  
  // Handle subscription renewal confirmations
  if (invoice.subscription) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, teamsmith_user_id, title, assurance_plan')
      .eq('assurance_subscription_id', invoice.subscription)
      .single();

    if (project) {
      // Update next billing date if needed
      await supabase
        .from('projects')
        .update({ assurance_active: true })
        .eq('id', project.id);
    }
  }
}

async function handleInvoicePaymentFailed(supabase: any, event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  logStep("Handling invoice payment failed", { invoiceId: invoice.id });

  // Handle failed subscription payments
  if (invoice.subscription) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, teamsmith_user_id, title')
      .eq('assurance_subscription_id', invoice.subscription)
      .single();

    if (project) {
      // Notify client about failed payment
      await supabase
        .from('notifications')
        .insert({
          user_id: project.teamsmith_user_id,
          type: 'payment_failed',
          title: 'Payment Failed - Action Required',
          message: `Your assurance plan payment for ${project.title} failed. Please update your payment method.`,
          related_id: project.id
        });
    }
  }
}