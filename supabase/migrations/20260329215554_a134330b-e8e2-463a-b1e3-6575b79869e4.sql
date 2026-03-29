
-- Fix the overly permissive INSERT policy by adding a basic check
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (
  customer_name IS NOT NULL AND customer_phone IS NOT NULL AND total > 0
);
