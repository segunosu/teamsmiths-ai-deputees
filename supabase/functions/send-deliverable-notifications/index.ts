import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DELIVERABLE-NOTIFICATIONS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const body = await req.json();
    const { deliverable_id, notification_type, additional_data } = body;

    if (!deliverable_id || !notification_type) {
      throw new Error("Missing required fields: deliverable_id, notification_type");
    }

    // Initialize Supabase with service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get deliverable details with project and participant info
    const { data: deliverable, error: deliverableError } = await supabaseService
      .from('project_deliverables')
      .select(`
        id, title, status, submitted_at, approved_at, rejection_reason,
        projects!inner (
          id, title,
          project_participants!inner (
            role,
            profiles!inner (user_id, email, full_name)
          )
        )
      `)
      .eq('id', deliverable_id)
      .single();

    if (deliverableError || !deliverable) {
      throw new Error(`Deliverable not found: ${deliverableError?.message}`);
    }

    logStep("Deliverable loaded", { 
      deliverableId: deliverable.id, 
      projectTitle: deliverable.projects.title,
      status: deliverable.status 
    });

    // Get all project participants
    const participants = deliverable.projects.project_participants || [];
    const clientEmails = participants
      .filter(p => p.role === 'client')
      .map(p => p.profiles?.email)
      .filter(Boolean);
    
    const freelancerEmails = participants
      .filter(p => p.role === 'freelancer')
      .map(p => p.profiles?.email)
      .filter(Boolean);

    // Send appropriate notifications based on type
    switch (notification_type) {
      case 'submitted': {
        logStep("Sending submitted notifications");
        
        // Notify clients that deliverable was submitted
        if (clientEmails.length > 0) {
          await resend.emails.send({
            from: "Platform <onboarding@resend.dev>",
            to: clientEmails,
            subject: `Deliverable Submitted: ${deliverable.title}`,
            html: `
              <h2>Deliverable Submitted for Review</h2>
              <p>A new deliverable has been submitted for your project <strong>${deliverable.projects.title}</strong>.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>📋 ${deliverable.title}</h3>
                <p><strong>Submitted:</strong> ${new Date(deliverable.submitted_at!).toLocaleDateString()}</p>
                <p><strong>Status:</strong> Awaiting your review</p>
              </div>
              
              <p>Please review the deliverable and provide feedback. You can:</p>
              <ul>
                <li>Approve the deliverable if it meets your requirements</li>
                <li>Request revisions with specific feedback</li>
                <li>Download and review all submitted files</li>
              </ul>
              
              <p style="margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/project/${deliverable.projects.id}" 
                   style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  Review Deliverable
                </a>
              </p>
              
              <p>Best regards,<br>The Platform Team</p>
            `,
          });
        }

        // Notify admins about submission for QA
        const { data: admins } = await supabaseService
          .from('profiles')
          .select('email')
          .eq('is_admin', true);

        if (admins && admins.length > 0) {
          await resend.emails.send({
            from: "Platform <onboarding@resend.dev>",
            to: admins.map(admin => admin.email).filter(Boolean),
            subject: `QA Required: ${deliverable.title}`,
            html: `
              <h2>Deliverable Submitted for QA</h2>
              <p>A deliverable requires quality assurance review.</p>
              <p><strong>Project:</strong> ${deliverable.projects.title}</p>
              <p><strong>Deliverable:</strong> ${deliverable.title}</p>
              <p><strong>Submitted:</strong> ${new Date(deliverable.submitted_at!).toLocaleDateString()}</p>
              <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/admin">Review in Admin Panel</a></p>
            `,
          });
        }
        break;
      }

      case 'approved': {
        logStep("Sending approved notifications");
        
        // Notify freelancers that their work was approved
        if (freelancerEmails.length > 0) {
          await resend.emails.send({
            from: "Platform <onboarding@resend.dev>",
            to: freelancerEmails,
            subject: `Deliverable Approved: ${deliverable.title}`,
            html: `
              <h2>🎉 Deliverable Approved!</h2>
              <p>Congratulations! Your deliverable has been approved by the client.</p>
              
              <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>✅ ${deliverable.title}</h3>
                <p><strong>Project:</strong> ${deliverable.projects.title}</p>
                <p><strong>Approved:</strong> ${new Date(deliverable.approved_at!).toLocaleDateString()}</p>
              </div>
              
              <p>Great work! The client is satisfied with your delivery. This milestone is now complete.</p>
              
              <p style="margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/project/${deliverable.projects.id}" 
                   style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  View Project
                </a>
              </p>
              
              <p>Keep up the excellent work!</p>
            `,
          });
        }

        // Notify clients of approval confirmation
        if (clientEmails.length > 0) {
          await resend.emails.send({
            from: "Platform <onboarding@resend.dev>",
            to: clientEmails,
            subject: `Deliverable Approved: ${deliverable.title}`,
            html: `
              <h2>Deliverable Approved</h2>
              <p>You have successfully approved the deliverable <strong>${deliverable.title}</strong> for project ${deliverable.projects.title}.</p>
              <p>This milestone is now complete and the project will proceed to the next phase.</p>
              <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/project/${deliverable.projects.id}">View Project Progress</a></p>
            `,
          });
        }
        break;
      }

      case 'revision_requested': {
        logStep("Sending revision requested notifications");
        
        const revisionReason = additional_data?.rejection_reason || deliverable.rejection_reason || 'No specific reason provided';
        
        // Notify freelancers that revisions are needed
        if (freelancerEmails.length > 0) {
          await resend.emails.send({
            from: "Platform <onboarding@resend.dev>",
            to: freelancerEmails,
            subject: `Revision Requested: ${deliverable.title}`,
            html: `
              <h2>Revision Requested</h2>
              <p>The client has requested revisions for your deliverable <strong>${deliverable.title}</strong>.</p>
              
              <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>📝 Feedback:</h3>
                <p>${revisionReason}</p>
              </div>
              
              <p>Please review the feedback and resubmit your deliverable once the requested changes have been made.</p>
              
              <p style="margin-top: 30px;">
                <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/project/${deliverable.projects.id}" 
                   style="background: #ffc107; color: #212529; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                  View Project & Resubmit
                </a>
              </p>
              
              <p>If you have any questions about the feedback, please reach out to discuss.</p>
            `,
          });
        }

        // Confirm to clients that revision request was sent
        if (clientEmails.length > 0) {
          await resend.emails.send({
            from: "Platform <onboarding@resend.dev>",
            to: clientEmails,
            subject: `Revision Request Sent: ${deliverable.title}`,
            html: `
              <h2>Revision Request Sent</h2>
              <p>Your revision request for <strong>${deliverable.title}</strong> has been sent to the freelancer.</p>
              <p>They will review your feedback and resubmit the deliverable with the requested changes.</p>
              <p><a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/project/${deliverable.projects.id}">Track Progress</a></p>
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