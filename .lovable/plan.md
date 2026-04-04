
# Criar Paginas "Categorias" e "Em Alta" com Visual Premium

## Problema
Os tabs "Categorias" e "Em Alta" na barra inferior apontam para `/categorias` e `/destaques`, mas essas rotas nao existem no App.tsx — resultam em 404.

## Solucao

### 1. Nova pagina `/categorias` — `src/pages/CategoriesPage.tsx`
- Layout premium com cards grandes para cada categoria
- Cada card mostra o icone da categoria, nome, e quantidade de produtos (via count query)
- Cards com gradiente sutil, hover com scale, animacoes stagger com framer-motion
- Link para `/categoria/{slug}` ao clicar
- Visual: grid 2 colunas mobile, 3 desktop, cards com aspect-ratio, icone centralizado grande

### 2. Nova pagina `/destaques` — `src/pages/TrendingPage.tsx`
- Logica dinamica: busca os produtos mais vendidos via `orders.items` (JSONB)
- Query: agrupa product_id dos items de todos os pedidos, conta quantidade vendida, ordena desc
- Fallback: se nao houver pedidos suficientes, complementa com produtos `featured = true`
- Visual premium: badge "🔥 Top N" nos primeiros 3 produtos, grid de ProductCards
- Titulo com icone Flame animado

### 3. `src/App.tsx`
- Adicionar rotas: `/categorias` → CategoriesPage, `/destaques` → TrendingPage

### Detalhes tecnicos

**Query "Em Alta"**: Como `orders.items` e JSONB array, vou extrair os product IDs client-side dos pedidos recentes (ultimos 30 dias) e contar frequencia. Alternativa mais performante: criar uma RPC function no Postgres que faz o aggregate diretamente. Vou usar a abordagem RPC.

**Nova RPC function** (migration):
```sql
CREATE OR REPLACE FUNCTION public.get_trending_products(days_back int DEFAULT 30, max_results int DEFAULT 20)
RETURNS TABLE(product_id uuid, total_sold bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT 
    (item->>'id')::uuid as product_id,
    SUM((item->>'quantity')::int) as total_sold
  FROM orders, jsonb_array_elements(items) as item
  WHERE created_at >= now() - (days_back || ' days')::interval
    AND payment_status != 'cancelled'
  GROUP BY (item->>'id')::uuid
  ORDER BY total_sold DESC
  LIMIT max_results;
$$;
```

Depois busco os produtos por ID para montar os cards.

## Arquivos

| Arquivo | Acao |
|---------|------|
| Migration SQL | Nova RPC `get_trending_products` |
| `src/pages/CategoriesPage.tsx` | Novo — grid premium de categorias |
| `src/pages/TrendingPage.tsx` | Novo — produtos mais vendidos |
| `src/App.tsx` | Adicionar 2 rotas |
