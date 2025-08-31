-- Add user_type column to profiles table to distinguish between clients and freelancers
ALTER TABLE public.profiles 
ADD COLUMN user_type text DEFAULT 'client' CHECK (user_type IN ('client', 'freelancer', 'admin'));

-- Update segun.osu@gmail.com to be a freelancer
UPDATE public.profiles 
SET user_type = 'freelancer' 
WHERE email = 'segun.osu@gmail.com';

-- Create a freelancer_profiles record for segun.osu@gmail.com if it doesn't exist
INSERT INTO public.freelancer_profiles (user_id, skills, industries, tools, locales)
SELECT user_id, '{}', '{}', '{}', '{}'
FROM public.profiles 
WHERE email = 'segun.osu@gmail.com'
ON CONFLICT (user_id) DO NOTHING;