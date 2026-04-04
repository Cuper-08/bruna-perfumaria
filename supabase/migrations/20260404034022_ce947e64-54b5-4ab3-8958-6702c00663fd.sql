CREATE OR REPLACE FUNCTION public.get_trending_products(days_back int DEFAULT 30, max_results int DEFAULT 20)
RETURNS TABLE(product_id uuid, total_sold bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    (item->>'id')::uuid as product_id,
    SUM((item->>'quantity')::int) as total_sold
  FROM orders, jsonb_array_elements(items) as item
  WHERE created_at >= now() - (days_back || ' days')::interval
    AND order_status != 'cancelled'
  GROUP BY (item->>'id')::uuid
  ORDER BY total_sold DESC
  LIMIT max_results;
$$;

GRANT EXECUTE ON FUNCTION public.get_trending_products(int, int) TO anon, authenticated;