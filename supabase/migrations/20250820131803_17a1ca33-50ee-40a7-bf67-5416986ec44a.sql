-- Create customization_requests table to capture client requirements
CREATE TABLE public.customization_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES public.products(id),
  company_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  project_title TEXT NOT NULL,
  base_template TEXT, -- Which template they're starting from
  custom_requirements TEXT NOT NULL, -- Their specific customization needs
  budget_range TEXT,
  timeline_preference TEXT,
  urgency_level TEXT DEFAULT 'standard',
  additional_context TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'quoted', 'approved', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customization_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for customization requests
CREATE POLICY "Users can view their own requests" 
ON public.customization_requests 
FOR SELECT 
USING (auth.uid() = user_id OR contact_email = auth.email());

CREATE POLICY "Users can create requests" 
ON public.customization_requests 
FOR INSERT 
WITH CHECK (true); -- Allow anyone to submit requests

CREATE POLICY "Users can update their own requests" 
ON public.customization_requests 
FOR UPDATE 
USING (auth.uid() = user_id OR contact_email = auth.email());

CREATE POLICY "Admins can manage all requests" 
ON public.customization_requests 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create function to update timestamps
CREATE TRIGGER update_customization_requests_updated_at
BEFORE UPDATE ON public.customization_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();