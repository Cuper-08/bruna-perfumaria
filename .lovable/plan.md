

# Corrigir Hero compacta + Scroll no ProductPage

## Problema 1: Hero com excesso de espaco
O container da hero tem `py-16 md:py-28` e o conteudo interno tem `py-10 md:py-14` + logo com `mb-6` + shimmer com `mb-6`. Isso cria muito espaco vermelho vazio acima da logo.

## Problema 2: ProductPage nao faz scroll to top
React Router nao faz scroll automatico ao navegar. Ao clicar num card, a pagina do produto mantem a posicao do scroll anterior (que esta la embaixo na home).

## Problema 3: Espacamento excessivo entre logo e texto
`mb-6` na logo + `mb-6` no shimmer = 3rem de gap entre logo e titulo.

## Alteracoes

### 1. `src/components/home/HeroBanner.tsx`
- Container externo: `py-16 md:py-28` → `py-6 md:py-12`
- Conteudo interno: `py-10 md:py-14` → `py-4 md:py-6`
- Logo wrapper: `mb-6` → `mb-3`
- Shimmer: `mb-6` → `mb-3`
- Subtitulo: `mb-8` → `mb-5`

### 2. `src/pages/ProductPage.tsx`
- Adicionar `useEffect` com `window.scrollTo(0, 0)` ao montar o componente (dependencia: `slug`)

### Resultado
Hero compacta com logo proxima ao topo, espacamento profissional entre elementos, e ProductPage sempre abre no topo.

