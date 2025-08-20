import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SUBMIT-CUSTOM-REQUEST] ${step}${detailsStr}`);
};

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const isRateLimited = (email: string): boolean => {
  const now = Date.now();
  const limit = rateLimitMap.get(email);
  
  if (!limit || now > limit.resetTime) {
    // Reset or create new entry (5 requests per hour)
    rateLimitMap.set(email, { count: 1, resetTime: now + 60 * 60 * 1000 });
    return false;
  }
  
  if (limit.count >= 5) {
    return true;
  }
  
  limit.count++;
  return false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const body = await req.json();
    const {
      company_name,
      contact_email,
      contact_phone,
      project_title,
      base_template,
      custom_requirements,
      budget_range,
      timeline_preference,
      urgency_level,
      additional_context,
      product_id
    } = body;

    // Validate required fields
    if (!contact_email || !project_title || !custom_requirements) {
      throw new Error("Missing required fields: contact_email, project_title, custom_requirements");
    }

    // Rate limiting check
    if (isRateLimited(contact_email)) {
      throw new Error("Rate limit exceeded. Please try again in an hour.");
    }

    logStep("Request validated", { contact_email, project_title });

    // Initialize Supabase with service role for secure operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Store the request
    const { data: requestData, error: insertError } = await supabaseService
      .from('customization_requests')
      .insert({
        company_name,
        contact_email,
        contact_phone,
        project_title,
        base_template,
        custom_requirements,
        budget_range,
        timeline_preference,
        urgency_level: urgency_level || 'standard',
        additional_context,
        product_id,
        status: 'new'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    logStep("Request stored", { requestId: requestData.id });

    // Get admin emails for notification
    const { data: admins } = await supabaseService
      .from('profiles')
      .select('email')
      .eq('is_admin', true);

    // Send notification emails to admins
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    if (admins && admins.length > 0) {
      await resend.emails.send({
        from: "Platform <onboarding@resend.dev>",
        to: admins.map(admin => admin.email).filter(Boolean),
        subject: `New Customization Request: ${project_title}`,
        html: `
          <h2>New Customization Request</h2>
          <p><strong>Project:</strong> ${project_title}</p>
          <p><strong>Company:</strong> ${company_name || 'Not provided'}</p>
          <p><strong>Contact:</strong> ${contact_email}</p>
          <p><strong>Budget Range:</strong> ${budget_range || 'Not specified'}</p>
          <p><strong>Timeline:</strong> ${timeline_preference || 'Not specified'}</p>
          <p><strong>Urgency:</strong> ${urgency_level}</p>
          
          <h3>Requirements:</h3>
          <p>${custom_requirements}</p>
          
          ${additional_context ? `<h3>Additional Context:</h3><p>${additional_context}</p>` : ''}
          
          <p><a href="${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'supabase.co')}/dashboard/admin">Review in Admin Dashboard</a></p>
        `,
      });
      
      logStep("Admin notification sent");
    }

    // Send confirmation email to requester with magic link prompt
    await resend.emails.send({
      from: "Platform <onboarding@resend.dev>",
      to: [contact_email],
      subject: "Customization Request Received - Create Your Account",
      html: `
        <h2>Thank you for your customization request!</h2>
        <p>We've received your request for <strong>${project_title}</strong> and our team will review it within 24 hours.</p>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Create your account to track progress and receive updates</li>
          <li>Our team will review your requirements</li>
          <li>We'll schedule a consultation call to discuss details</li>
          <li>You'll receive a detailed quote with timeline</li>
        </ol>
        
        <p style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <strong>🔗 Create Your Account:</strong><br>
          <a href="${req.headers.get("origin")}/auth?email=${encodeURIComponent(contact_email)}&flow=signup" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">
            Create Account & Track Progress
          </a>
        </p>
        
        <p>Questions? Reply to this email or call us at your convenience.</p>
        
        <p>Best regards,<br>The Platform Team</p>
      `,
    });

    logStep("Confirmation email sent to requester");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Request submitted successfully",
      requestId: requestData.id
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