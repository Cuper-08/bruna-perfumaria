CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.search_products(search_term text)
RETURNS SETOF products
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM products
  WHERE active = true
    AND (
      unaccent(lower(title)) ILIKE '%' || unaccent(lower(search_term)) || '%'
      OR unaccent(lower(COALESCE(description, ''))) ILIKE '%' || unaccent(lower(search_term)) || '%'
    )
  ORDER BY
    CASE WHEN unaccent(lower(title)) ILIKE unaccent(lower(search_term)) || '%' THEN 0 ELSE 1 END,
    title
  LIMIT 50;
$$;

GRANT EXECUTE ON FUNCTION public.search_products(text) TO anon, authenticated;