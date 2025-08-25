-- Fix the origin_id field to handle string identifiers like "marketing-content-engine"
-- Change from UUID to TEXT to support capability/catalog string IDs

ALTER TABLE public.briefs 
ALTER COLUMN origin_id TYPE text;