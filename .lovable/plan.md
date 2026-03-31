

# Barra de Pesquisa Premium na Hero + Pagina de Resultados

## Resumo
Adicionar uma barra de pesquisa estilizada abaixo do botao "Ver Colecao" na hero, com busca inteligente (case-insensitive, accent-insensitive) que funciona para 1000+ produtos. Ao digitar, mostra sugestoes em dropdown. Ao confirmar, navega para uma pagina de resultados.

## Alteracoes

### 1. Migration: extensao `unaccent` + funcao de busca
```sql
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.search_products(search_term text)
RETURNS SETOF products
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM products
  WHERE active = true
    AND (
      unaccent(lower(title)) ILIKE '%' || unaccent(lower(search_term)) || '%'
      OR unaccent(lower(description)) ILIKE '%' || unaccent(lower(search_term)) || '%'
    )
  ORDER BY
    CASE WHEN unaccent(lower(title)) ILIKE unaccent(lower(search_term)) || '%' THEN 0 ELSE 1 END,
    title
  LIMIT 50;
$$;
```
Isso garante busca sem acento, sem case sensitivity, e prioriza matches no inicio do titulo.

### 2. Novo: `src/components/home/HeroSearchBar.tsx`
- Input com icone de lupa, estilo glassmorphism (`bg-white/15 backdrop-blur-md border border-white/20`)
- Placeholder: "Buscar perfumes, maquiagem..."
- Debounce de 300ms no input
- Dropdown com ate 6 sugestoes (imagem thumbnail + titulo + preco)
- Clique na sugestao navega para `/produto/:slug`
- Enter ou clique na lupa navega para `/busca?q=termo`
- Animacao fade-in com framer-motion

### 3. Novo: `src/pages/SearchPage.tsx`
- Le `?q=` da URL
- Chama RPC `search_products` via Supabase
- Grid de ProductCards com os resultados
- Estado vazio: "Nenhum produto encontrado para '{termo}'"
- Loading skeleton enquanto busca

### 4. `src/components/home/HeroBanner.tsx`
- Importar e renderizar `<HeroSearchBar />` abaixo do botao CTA
- Animacao stagger (delay 0.6s)

### 5. `src/App.tsx`
- Adicionar rota `/busca` → `SearchPage`

### 6. Novo: `src/hooks/useProductSearch.ts`
- Hook com TanStack Query que chama `supabase.rpc('search_products', { search_term })`
- `enabled: term.length >= 2`
- `staleTime: 30s` para cache

## Arquivos

| Arquivo | Acao |
|---------|------|
| Migration SQL | Criar extensao unaccent + funcao RPC |
| `src/components/home/HeroSearchBar.tsx` | Novo — barra de pesquisa premium |
| `src/hooks/useProductSearch.ts` | Novo — hook de busca |
| `src/pages/SearchPage.tsx` | Novo — pagina de resultados |
| `src/components/home/HeroBanner.tsx` | Adicionar HeroSearchBar |
| `src/App.tsx` | Adicionar rota /busca |

## Resultado
Barra de pesquisa premium com glassmorphism na hero, busca accent/case insensitive via Postgres `unaccent`, sugestoes em tempo real com debounce, e pagina de resultados completa — pronto para escalar com 1000+ produtos.

