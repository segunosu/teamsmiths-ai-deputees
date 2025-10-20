-- Remove "vetted" language from case studies for more consultancy-appropriate tone

UPDATE business_case_studies
SET solution = 'Deployed the Proposal Speed-Up pack (10-day engagement). AI Deputee™ ran an intake chat with Sarah to capture offering tiers, pricing bands and past proposal examples and generated a reusable template library and pre-filled proposal drafts per buyer persona. Assigned a specialist to finalise tone & set up an automated CRM → proposal pipeline (templates, inline personalization tokens, and an approval milestone).'
WHERE slug = 'proposal-speedup';