

# Remover Header e Glass Card da Hero

## O que muda

O usuario quer remover o Header (barra de navegacao superior) e o "glass card" (moldura com fundo translucido e borda) que envolve o conteudo central da Hero. O conteudo (logo, texto, botao) fica direto sobre o gradiente vermelho, como no print.

## Alteracoes

### 1. `src/components/layout/StoreLayout.tsx`
- Remover o `<Header />` do layout (linha 15)
- Remover o import do Header

### 2. `src/components/home/HeroBanner.tsx`
- Remover o glass card wrapper (`bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-3xl`) da linha 62
- Substituir por um `motion.div` simples sem fundo, sem borda, sem backdrop — apenas `flex flex-col items-center text-center max-w-lg mx-auto px-6 py-10`
- Manter todo o conteudo interno (logo, shimmer, titulo, subtitulo, CTA) e suas animacoes
- Manter os blobs flutuantes e sparkles no fundo

## Resultado
Hero limpa com conteudo centralizado direto sobre o gradiente vermelho, sem moldura glass e sem header acima.

