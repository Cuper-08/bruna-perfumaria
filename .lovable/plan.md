

# Animacoes com Framer Motion — Home Premium

## Resumo
Instalar `framer-motion` e adicionar animacoes de entrada (scroll-triggered) nas secoes da home e cards de produto. Cada secao aparece com fade-up ao entrar no viewport. Cards de produto e categorias entram com stagger (um apos o outro).

## Alteracoes

### 1. Instalar `framer-motion`
- `npm install framer-motion`

### 2. `src/components/home/HeroBanner.tsx`
- Wrap logo, titulo, subtitulo e CTA em `motion.div` com animacoes sequenciais (delay escalonado)
- Logo: scale de 0.8 para 1 + fade
- Texto: fade-up com delay 0.2s
- CTA: fade-up com delay 0.4s

### 3. `src/components/home/CategoryGrid.tsx`
- Titulo da secao: fade-in ao entrar no viewport (`whileInView`)
- Cada card de categoria: `motion.div` com stagger de 0.08s entre cards usando `variants` + `staggerChildren`
- Hover: `whileHover={{ scale: 1.05, y: -2 }}` (substitui CSS hover)

### 4. `src/components/home/TrustBanner.tsx`
- Container: `whileInView` fade-up
- Cada item: stagger de 0.1s com fade + slide lateral

### 5. `src/components/home/FeaturedProducts.tsx`
- Titulo: fade-in `whileInView`
- Grid de produtos: `staggerChildren: 0.1` — cada card entra com fade-up sequencial

### 6. `src/components/product/ProductCard.tsx`
- Wrap o `Link` em `motion.div` com `whileHover={{ y: -4 }}` e `whileInView` fade-up
- Botao de adicionar: `whileTap={{ scale: 0.9 }}` para feedback tatil

### Padrao de animacao
Todas as secoes usam `whileInView` com `viewport={{ once: true, margin: '-50px' }}` para animar apenas na primeira vez que entram no viewport. Stagger containers usam variants:
```
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }
```

## Arquivos

| Arquivo | Acao |
|---------|------|
| `package.json` | Adicionar framer-motion |
| `src/components/home/HeroBanner.tsx` | Animacoes sequenciais |
| `src/components/home/CategoryGrid.tsx` | Stagger nos cards |
| `src/components/home/TrustBanner.tsx` | Fade-up com stagger |
| `src/components/home/FeaturedProducts.tsx` | Stagger nos produtos |
| `src/components/product/ProductCard.tsx` | whileHover + whileTap |

