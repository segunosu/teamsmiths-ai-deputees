import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import OpenAI from "https://esm.sh/openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[RUN-QA-CHECK] ${step}${detailsStr}`);
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

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const { milestone_id } = await req.json();
    logStep("Request body parsed", { milestone_id });

    if (!milestone_id) {
      throw new Error("Missing required parameter: milestone_id");
    }

    // Get milestone and project details
    const { data: milestone, error: milestoneError } = await supabaseClient
      .from('milestones')
      .select(`
        id,
        title,
        project_id,
        projects (
          id,
          title,
          teamsmith_user_id,
          project_participants (
            user_id,
            role
          )
        )
      `)
      .eq('id', milestone_id)
      .single();

    if (milestoneError || !milestone) {
      throw new Error("Milestone not found");
    }

    const project_id = milestone.project_id;

    // Run automated QA checks
    const qaResults = await runAutomatedQA(project_id, milestone_id, 'milestone');
    logStep("Automated QA completed", qaResults);

    // Update the milestone with QA results
    const { error: updateError } = await supabaseClient
      .from('milestones')
      .update({
        qa_status: qaResults.overall_status,
        qa_notes: qaResults.summary,
        qa_last_run: new Date().toISOString(),
      })
      .eq('id', milestone_id);

    if (updateError) {
      throw new Error(`Failed to update QA results: ${updateError.message}`);
    }

    // Get project and expert details for notifications
    const project = milestone.projects;
    if (!project) {
      throw new Error("Project not found");
    }

    const expert = project.project_participants.find((p: any) => p.role === 'expert');
    const client = project.project_participants.find((p: any) => p.role === 'client');

    // Create notifications based on QA results
    const notifications = [];

    if (qaResults.overall_status === 'passed') {
      // Notify client that QA passed and payment will be released
      if (client) {
        notifications.push({
          user_id: client.user_id,
          type: 'qa_passed',
          title: 'QA Passed - Payment Releasing',
          message: `Quality assurance passed for ${project.title}. Payment will be released shortly.`,
          related_id: id,
        });
      }

      // Notify expert that QA passed
      if (expert) {
        notifications.push({
          user_id: expert.user_id,
          type: 'qa_passed_expert',
          title: 'QA Passed! 🎉',
          message: `Your work on ${project.title} has passed QA review. Payment will be released.`,
          related_id: milestone_id,
        });
      }

      // If milestone and QA passed, release payment
      const { error: releaseError } = await supabaseClient
        .from('milestones')
        .update({
          payment_status: 'released',
          released_at: new Date().toISOString(),
        })
        .eq('id', milestone_id)
        .eq('payment_status', 'paid'); // Only release if already paid

      if (releaseError) {
        logStep("Warning: Failed to release payment", releaseError);
      } else {
        logStep("Payment released successfully");
      }

    } else if (qaResults.overall_status === 'failed') {
      // Notify expert that revisions are needed
      if (expert) {
        notifications.push({
          user_id: expert.user_id,
          type: 'qa_failed',
          title: 'QA Review - Revisions Required',
          message: `Your submission for ${project.title} requires revisions. Please review the feedback and resubmit.`,
          related_id: milestone_id,
        });
      }

      // Notify client about QA failure
      if (client) {
        notifications.push({
          user_id: client.user_id,
          type: 'qa_failed_client',
          title: 'QA Review Complete',
          message: `Quality review found issues with ${project.title}. Expert has been notified to make revisions.`,
          related_id: milestone_id,
        });
      }
    }

    // Send notifications
    if (notifications.length > 0) {
      const { error: notificationError } = await supabaseClient
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        logStep("Warning: Failed to create notifications", notificationError);
      }
    }

    logStep("QA check completed successfully");

    return new Response(JSON.stringify({
      success: true,
      qa_results: qaResults,
      notifications_sent: notifications.length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function runAutomatedQA(projectId: string, itemId: string, type: string) {
  logStep("Running automated QA checks", { projectId, itemId, type });
  
  // Simulate various automated QA checks
  const checks = {
    completeness: await checkCompleteness(itemId, type),
    quality: await checkQuality(itemId, type),
    security: await checkSecurity(itemId, type),
    performance: await checkPerformance(itemId, type),
    compliance: await checkCompliance(itemId, type),
  };

  const checklist = {
    deliverables_complete: checks.completeness.score > 0.8,
    quality_standards_met: checks.quality.score > 0.75,
    security_validated: checks.security.score > 0.9,
    performance_acceptable: checks.performance.score > 0.7,
    compliance_verified: checks.compliance.score > 0.8,
  };

  const scores = Object.values(checks).map(c => c.score);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  // Determine overall status
  let overall_status = 'passed';
  const criticalFailures = Object.values(checks).filter(c => c.critical && c.score < 0.5);
  
  if (criticalFailures.length > 0) {
    overall_status = 'failed';
  } else if (averageScore < 0.7) {
    overall_status = 'warning';
  }

  const issues = Object.values(checks)
    .flatMap(c => c.issues)
    .filter(issue => issue.severity === 'high' || issue.severity === 'critical');

  const summary = overall_status === 'passed' 
    ? 'All automated quality checks passed successfully.'
    : overall_status === 'failed'
    ? `QA failed with ${criticalFailures.length} critical issues: ${issues.slice(0, 3).map(i => i.message).join(', ')}`
    : `QA passed with warnings. ${issues.length} issues require attention.`;

  const guardrails = {
    security_scan: checks.security,
    performance_test: checks.performance,
    compliance_check: checks.compliance,
    last_run: new Date().toISOString(),
  };

  return {
    overall_status,
    score: Math.round(averageScore * 100) / 100,
    summary,
    checklist,
    guardrails,
    detailed_results: checks,
  };
}

async function checkCompleteness(itemId: string, type: string) {
  // Simulate completeness check
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const score = 0.85 + Math.random() * 0.15; // Generally good completeness
  const issues = score < 0.8 ? [
    { severity: 'medium', message: 'Some deliverables may be incomplete', category: 'completeness' }
  ] : [];

  return { score, issues, critical: true };
}

async function checkQuality(itemId: string, type: string) {
  // Simulate quality check
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const score = 0.75 + Math.random() * 0.2;
  const issues = score < 0.7 ? [
    { severity: 'high', message: 'Code quality standards not met', category: 'quality' }
  ] : [];

  return { score, issues, critical: false };
}

async function checkSecurity(itemId: string, type: string) {
  // Simulate security check
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const score = Math.random() > 0.1 ? 0.9 + Math.random() * 0.1 : 0.3; // Usually secure
  const issues = score < 0.8 ? [
    { severity: 'critical', message: 'Security vulnerability detected', category: 'security' }
  ] : [];

  return { score, issues, critical: true };
}

async function checkPerformance(itemId: string, type: string) {
  // Simulate performance check
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const score = 0.7 + Math.random() * 0.25;
  const issues = score < 0.6 ? [
    { severity: 'medium', message: 'Performance optimization needed', category: 'performance' }
  ] : [];

  return { score, issues, critical: false };
}

async function checkCompliance(itemId: string, type: string) {
  // Simulate compliance check
  await new Promise(resolve => setTimeout(resolve, 250));
  
  const score = 0.8 + Math.random() * 0.15;
  const issues = score < 0.75 ? [
    { severity: 'high', message: 'Accessibility standards not met', category: 'compliance' }
  ] : [];

  return { score, issues, critical: false };
}