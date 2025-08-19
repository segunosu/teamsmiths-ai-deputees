-- Fix infinite recursion in RLS by removing self-referential subqueries on profiles
-- and replacing them with security definer function calls.

-- 1) Profiles policies: replace recursive subqueries with public.is_admin()
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile or admin"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id OR public.is_admin(auth.uid())
);

CREATE POLICY "Users can update their own profile or admin"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = user_id OR public.is_admin(auth.uid())
);

-- 2) Categories: use is_admin() instead of subquery to profiles
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
ON public.categories
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Keep the public SELECT policy as-is

-- 3) Products: use is_admin() instead of subquery to profiles
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Keep public SELECT policy (is_active = true)

-- 4) Subcategories: use is_admin() instead of subquery to profiles
DROP POLICY IF EXISTS "Admins can manage subcategories" ON public.subcategories;
CREATE POLICY "Admins can manage subcategories"
ON public.subcategories
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
