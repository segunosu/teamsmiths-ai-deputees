import { z } from "zod";

export const ProposalZ = z.object({
  roles: z.array(z.string()).min(1),
  timeline_weeks: z.number().int().positive(),
  budget_band: z.string().min(1),
  success_metrics: z.array(z.string()).min(1),
  milestones: z.array(z.object({
    title: z.string().min(1),
    outcomes: z.array(z.string()).min(1),
    eta_days: z.number().int().positive(),
  })).min(3),
  assured_addon_note: z.string().optional(),
});

export type Proposal = z.infer<typeof ProposalZ>;

// Fallback proposal when AI generation fails
export function createFallbackProposal(): Proposal {
  return {
    roles: ["Business Consultant", "Project Manager"],
    timeline_weeks: 4,
    budget_band: "£6k–£10k",
    success_metrics: [
      "Clear project roadmap delivered",
      "Key stakeholders aligned",
      "Success criteria defined"
    ],
    milestones: [
      {
        title: "Discovery & Requirements",
        outcomes: [
          "Stakeholder interviews completed",
          "Requirements document finalized",
          "Success criteria defined"
        ],
        eta_days: 7
      },
      {
        title: "Strategy & Planning",
        outcomes: [
          "Strategic plan developed",
          "Implementation roadmap created",
          "Resource requirements identified"
        ],
        eta_days: 10
      },
      {
        title: "Implementation & Handover",
        outcomes: [
          "Initial implementation completed",
          "Team training delivered",
          "Documentation and handover completed"
        ],
        eta_days: 10
      }
    ],
    assured_addon_note: "QA + replacement eligibility; ~12% uplift"
  };
}

// Repair function to fix incomplete proposals
export function repairProposal(rawProposal: any): Proposal {
  const fallback = createFallbackProposal();
  
  return {
    roles: Array.isArray(rawProposal.roles) && rawProposal.roles.length > 0 
      ? rawProposal.roles 
      : fallback.roles,
    timeline_weeks: typeof rawProposal.timeline_weeks === 'number' && rawProposal.timeline_weeks > 0
      ? rawProposal.timeline_weeks
      : fallback.timeline_weeks,
    budget_band: typeof rawProposal.budget_band === 'string' && rawProposal.budget_band.length > 0
      ? rawProposal.budget_band
      : fallback.budget_band,
    success_metrics: Array.isArray(rawProposal.success_metrics) && rawProposal.success_metrics.length > 0
      ? rawProposal.success_metrics
      : fallback.success_metrics,
    milestones: Array.isArray(rawProposal.milestones) && rawProposal.milestones.length >= 3
      ? rawProposal.milestones.map((m: any) => ({
          title: typeof m.title === 'string' ? m.title : 'Milestone',
          outcomes: Array.isArray(m.outcomes) ? m.outcomes : ['Outcome to be defined'],
          eta_days: typeof m.eta_days === 'number' ? m.eta_days : 7
        }))
      : fallback.milestones,
    assured_addon_note: rawProposal.assured_addon_note || fallback.assured_addon_note
  };
}