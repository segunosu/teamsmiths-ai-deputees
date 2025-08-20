import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[QUOTE-NOTIFICATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const body = await req.json();
    const { quote_id, notification_type } = body;

    if (!quote_id || !notification_type) {
      throw new Error("Missing required fields: quote_id, notification_type");
    }

    // Initialize Supabase with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get quote details with user info
    const { data: quote, error: quoteError } = await supabaseService
      .from('custom_quotes')
      .select(`
        id, quote_number, project_title, total_amount, currency, status,
        milestones, deliverables, estimated_duration, estimated_start_date,
        expires_at, approved_at,
        profiles!user_id (email, full_name)
      `)
      .eq('id', quote_id)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote not found: ${quoteError?.message}`);
    }

    logStep("Quote loaded", { 
      quoteId: quote.id, 
      quoteNumber: quote.quote_number,
      projectTitle: quote.project_title,
      status: quote.status 
    });

    const userEmail = quote.profiles?.email;
    const userName = quote.profiles?.full_name || 'there';

    if (!userEmail) {
      throw new Error("No user email found for quote");
    }

    // Send appropriate notifications based on type
    switch (notification_type) {
      case 'quote_ready': {
        logStep("Sending quote ready notification");
        
        await resend.emails.send({
          from: "Platform <onboarding@resend.dev>",
          to: [userEmail],
          subject: `Your Custom Quote is Ready: ${quote.project_title}`,
          html: `
            <h2>Your Custom Quote is Ready! 📋</h2>
            <p>Hi ${userName},</p>
            <p>Great news! We've prepared your custom quote for <strong>${quote.project_title}</strong>.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
              <h3>Quote Summary</h3>
              <p><strong>Quote Number:</strong> ${quote.quote_number}</p>
              <p><strong>Project:</strong> ${quote.project_title}</p>
              <p><strong>Total Investment:</strong> £${(quote.total_amount / 100).toLocaleString()}</p>
              <p><strong>Estimated Duration:</strong> ${quote.estimated_duration || 'To be confirmed'}</p>
              <p><strong>Valid Until:</strong> ${new Date(quote.expires_at).toLocaleDateString()}</p>
            </div>
            
            <h3>What's Included:</h3>
            <div style="background: #e8f5e8; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h4>📦 Deliverables:</h4>
              ${Array.isArray(quote.deliverables) ? 
                quote.deliverables.map((d: any) => `<p>• ${d.title}: ${d.description}</p>`).join('') :
                '<p>Detailed deliverables list available in your dashboard</p>'
              }
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h4>🎯 Milestones:</h4>
              ${Array.isArray(quote.milestones) ? 
                quote.milestones.map((m: any, index: number) => 
                  `<p><strong>Milestone ${index + 1}:</strong> ${m.title} - £${(m.amount / 100).toLocaleString()}</p>`
                ).join('') :
                '<p>Milestone breakdown available in your dashboard</p>'
              }
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Review the full quote details in your dashboard</li>
              <li>Ask any questions you might have</li>
              <li>Approve the quote to begin your project</li>
            </ol>
            
            <p style="margin-top: 30px;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/quote/${quote.id}" 
                 style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Review & Approve Quote
              </a>
            </p>
            
            <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
              This quote is valid until ${new Date(quote.expires_at).toLocaleDateString()}. 
              If you have any questions, simply reply to this email.
            </p>
            
            <p>Looking forward to working with you!</p>
            <p>Best regards,<br>The Platform Team</p>
          `,
        });
        break;
      }

      case 'quote_approved': {
        logStep("Sending quote approved notification");
        
        // Notify client of approval confirmation
        await resend.emails.send({
          from: "Platform <onboarding@resend.dev>",
          to: [userEmail],
          subject: `Quote Approved - Project Starting Soon: ${quote.project_title}`,
          html: `
            <h2>🎉 Quote Approved - Let's Get Started!</h2>
            <p>Hi ${userName},</p>
            <p>Fantastic! You've approved quote ${quote.quote_number} for <strong>${quote.project_title}</strong>.</p>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>✅ What Happens Next:</h3>
              <ol>
                <li><strong>Project Setup:</strong> We're creating your project workspace</li>
                <li><strong>Team Assignment:</strong> Our experts are being assigned to your project</li>
                <li><strong>Milestone 1:</strong> Work begins on the first deliverable</li>
                <li><strong>Regular Updates:</strong> You'll receive progress updates throughout</li>
              </ol>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <h4>📊 Project Overview:</h4>
              <p><strong>Total Investment:</strong> £${(quote.total_amount / 100).toLocaleString()}</p>
              <p><strong>Estimated Start:</strong> ${quote.estimated_start_date ? new Date(quote.estimated_start_date).toLocaleDateString() : 'Within 2-3 business days'}</p>
              <p><strong>Estimated Duration:</strong> ${quote.estimated_duration || 'As outlined in quote'}</p>
            </div>
            
            <p><strong>What to Expect:</strong></p>
            <ul>
              <li>You'll receive login details for your project dashboard</li>
              <li>Direct communication with your assigned team</li>
              <li>Real-time progress tracking and file sharing</li>
              <li>Milestone-based delivery and approval process</li>
            </ul>
            
            <p style="margin-top: 30px;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/dashboard" 
                 style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Access Your Dashboard
              </a>
            </p>
            
            <p>We're excited to work with you and deliver exceptional results for ${quote.project_title}!</p>
            <p>Best regards,<br>The Platform Team</p>
          `,
        });

        // Notify admins about approved quote
        const { data: admins } = await supabaseService
          .from('profiles')
          .select('email')
          .eq('is_admin', true);

        if (admins && admins.length > 0) {
          await resend.emails.send({
            from: "Platform <onboarding@resend.dev>",
            to: admins.map(admin => admin.email).filter(Boolean),
            subject: `Quote Approved: ${quote.project_title} - £${(quote.total_amount / 100).toLocaleString()}`,
            html: `
              <h2>Quote Approved - Project Creation Required</h2>
              <p>A custom quote has been approved and requires project setup:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <p><strong>Quote:</strong> ${quote.quote_number}</p>
                <p><strong>Project:</strong> ${quote.project_title}</p>
                <p><strong>Value:</strong> £${(quote.total_amount / 100).toLocaleString()}</p>
                <p><strong>Client:</strong> ${userName} (${userEmail})</p>
                <p><strong>Approved:</strong> ${new Date(quote.approved_at!).toLocaleDateString()}</p>
              </div>
              
              <p><strong>Action Required:</strong></p>
              <ul>
                <li>Create project and assign team members</li>
                <li>Set up project milestones and deliverables</li>
                <li>Send welcome email to client with project access</li>
              </ul>
              
              <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/admin">Manage in Admin Panel</a></p>
            `,
          });
        }
        break;
      }

      default:
        throw new Error(`Unknown notification type: ${notification_type}`);
    }

    logStep("Notifications sent successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${notification_type} notifications sent successfully` 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});