

# Header, Hero e Footer — Logos Maiores + Glassmorphism + Animacoes

## Problema
- Logos no header (h-10), hero (h-24) e footer (h-10) estao muito pequenas
- Header e hero sao blocos vermelho solido estaticos, sem vida
- Falta glassmorphism, particulas flutuantes e micro-animacoes que deem energia

## Alteracoes

### 1. `src/components/layout/Header.tsx`
- Logo maior: `h-12 md:h-14`
- Adicionar glassmorphism: `bg-primary/80 backdrop-blur-xl` com borda inferior `border-b border-white/10`
- Wrap com `motion.header` para fade-in na montagem
- Promo bar com animacao de texto deslizante (marquee sutil)

### 2. `src/components/home/HeroBanner.tsx`
- Logo muito maior: `h-32 md:h-44`
- Adicionar circulos flutuantes animados com framer-motion (3-4 blobs de `bg-white/5` e `bg-accent/10` com animate float infinito)
- Adicionar efeito glassmorphism card atras do conteudo central: `bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-3xl`
- Shimmer divider mais largo (`w-32`)
- Particulas/sparkles sutis com keyframes CSS
- Mais padding vertical (`py-16 md:py-28`)

### 3. `src/components/layout/Footer.tsx`
- Logo maior: `h-14 md:h-16`
- Remover `brightness-0 invert` — usar `opacity-90` para manter o logo mais visivel

### 4. `src/index.css`
- Adicionar keyframe `float` para os blobs flutuantes do hero
- Adicionar keyframe `sparkle` para particulas

## Resultado
Header com glassmorphism translucido sobre vermelho, hero com blobs flutuantes animados e card glass central dando profundidade, logos visivelmente maiores em todos os pontos. Tudo mantendo a essencia vermelha da marca.

