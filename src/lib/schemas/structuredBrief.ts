import { z } from "zod";

export const GoalZ = z.object({
  interpreted: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.5),
  normalized: z.object({
    metric: z.string().optional(),         // "2x revenue"
    timeframe: z.string().optional(),      // "12 months"
    objective: z.string().optional(),      // "increase revenue"
  }).default({}),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export const ContextZ = z.object({
  interpreted: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.5),
  normalized: z.object({
    industry: z.string().optional(),
    org_size: z.string().optional(),       // "SMB", "100 employees", etc.
    region: z.string().optional(),
    revenue_usd: z.string().optional(),
    employee_count: z.string().optional(),
  }).default({}),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export const ConstraintsZ = z.object({
  interpreted: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.5),
  normalized: z.object({
    hardware_support: z.string().optional(),   // "Nvidia chips"
    integration_software: z.string().optional(),
    ai_model_compatibility: z.string().optional(),
  }).default({}),
  tags: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});

export const StructuredBriefZ = z.object({
  goal: GoalZ,
  context: ContextZ,
  constraints: ConstraintsZ,
  urgency: z.string().optional(),
  timeline: z.string().optional(),
  budget_range: z.string().optional(),
  expert_style: z.string().optional(),
  missing: z.array(z.string()).default([]),
});

export type StructuredBrief = z.infer<typeof StructuredBriefZ>;

// Normalization helper to extract values from interpreted text
export function normalizeStructuredBrief(raw: any): StructuredBrief {
  const parseSection = (section: any, type: 'goal' | 'context' | 'constraints') => {
    if (!section) return null;
    
    const interpreted = section.interpreted || '';
    const confidence = typeof section.confidence === 'number' ? section.confidence : 0.5;
    const warnings = Array.isArray(section.warnings) ? section.warnings : [];
    const tags = Array.isArray(section.tags) ? section.tags : [];
    
    let normalized = section.normalized || {};
    
    // Extract values from interpreted text if normalized is empty
    if (type === 'goal' && Object.keys(normalized).length === 0) {
      // Extract metric patterns
      const metricPatterns = [/(\d+x|\d+\%|double|triple|increase.*by.*\d+)/i];
      const timePatterns = [/(\d+\s*(month|week|year|day)s?)/i, /(within.*\d+|by.*\d+)/i];
      
      metricPatterns.forEach(pattern => {
        const match = interpreted.match(pattern);
        if (match && !normalized.metric) {
          normalized.metric = match[1];
        }
      });
      
      timePatterns.forEach(pattern => {
        const match = interpreted.match(pattern);
        if (match && !normalized.timeframe) {
          normalized.timeframe = match[1];
        }
      });
      
      if (!normalized.objective && interpreted) {
        // Extract main objective (first part of sentence typically)
        const firstSentence = interpreted.split('.')[0];
        if (firstSentence.length < 100) {
          normalized.objective = firstSentence;
        }
      }
    }
    
    if (type === 'context' && Object.keys(normalized).length === 0) {
      // Extract industry patterns
      const industryPatterns = [/(construction|technology|finance|healthcare|retail|manufacturing)/i];
      const sizePatterns = [/(\d+\s*employees?|\d+\s*people|small|medium|large|enterprise)/i];
      const regionPatterns = [/(europe|asia|america|uk|us|global)/i];
      
      industryPatterns.forEach(pattern => {
        const match = interpreted.match(pattern);
        if (match && !normalized.industry) {
          normalized.industry = match[1];
        }
      });
      
      sizePatterns.forEach(pattern => {
        const match = interpreted.match(pattern);
        if (match && !normalized.org_size) {
          normalized.org_size = match[1];
        }
      });
      
      regionPatterns.forEach(pattern => {
        const match = interpreted.match(pattern);
        if (match && !normalized.region) {
          normalized.region = match[1];
        }
      });
    }
    
    if (type === 'constraints' && Object.keys(normalized).length === 0) {
      // Extract constraint patterns
      const hardwarePatterns = [/(nvidia|gpu|chip|hardware)/i];
      const softwarePatterns = [/(software|system|platform|tool)/i];
      const aiPatterns = [/(ai|model|machine learning|ml)/i];
      
      hardwarePatterns.forEach(pattern => {
        const match = interpreted.match(pattern);
        if (match && !normalized.hardware_support) {
          normalized.hardware_support = match[1];
        }
      });
      
      softwarePatterns.forEach(pattern => {
        const match = interpreted.match(pattern);
        if (match && !normalized.integration_software) {
          normalized.integration_software = match[1];
        }
      });
      
      aiPatterns.forEach(pattern => {
        const match = interpreted.match(pattern);
        if (match && !normalized.ai_model_compatibility) {
          normalized.ai_model_compatibility = match[1];
        }
      });
    }
    
    return {
      interpreted,
      confidence,
      normalized,
      tags,
      warnings
    };
  };
  
  const goal = parseSection(raw.goal, 'goal');
  const context = parseSection(raw.context, 'context');
  const constraints = parseSection(raw.constraints, 'constraints');
  
  // Determine missing fields
  const missing: string[] = [];
  if (!raw.timeline) missing.push('timeline');
  if (!raw.budget_range) missing.push('budget_range');
  if (!goal?.normalized?.metric) missing.push('goal_metric');
  
  return {
    goal: goal || { interpreted: '', confidence: 0.5, normalized: {}, tags: [], warnings: [] },
    context: context || { interpreted: '', confidence: 0.5, normalized: {}, tags: [], warnings: [] },
    constraints: constraints || { interpreted: '', confidence: 0.5, normalized: {}, tags: [], warnings: [] },
    urgency: raw.urgency,
    timeline: raw.timeline,
    budget_range: raw.budget_range,
    expert_style: raw.expert_style,
    missing
  };
}