-- Update case studies to remove "freelancer" terminology and use "expert" instead

UPDATE business_case_studies
SET solution = 'Deployed the Proposal Speed-Up pack (10-day engagement). AI Deputee™ ran an intake chat with Sarah to capture offering tiers, pricing bands and past proposal examples and generated a reusable template library and pre-filled proposal drafts per buyer persona. Matched a vetted specialist to finalise tone & set up an automated CRM → proposal pipeline (templates, inline personalization tokens, and an approval milestone).'
WHERE slug = 'proposal-speedup';

UPDATE business_case_studies
SET solution = 'Implemented the Quote Booster flow (3-week sprint). AI Deputee™ parsed standard job templates, historical quote success data, and margin constraints to auto-produce modular quotes by scope and optional add-ons. Matched a pricing specialist to review and refine margins and uplift messaging. Integrated quotes with e-sign and follow-up automation to reduce friction.'
WHERE slug = 'quote-booster';