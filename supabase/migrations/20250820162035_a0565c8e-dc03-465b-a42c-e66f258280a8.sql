-- Add stripe_price_id column to products table for better Stripe integration
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_stripe_price_id ON public.products(stripe_price_id) WHERE stripe_price_id IS NOT NULL;