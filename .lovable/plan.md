

# Atualizar Logo no Header e Hero

## O que muda

O logo atual (`bruna-logo.webp`) esta sendo exibido com `rounded-full` (circular) e borda. O usuario quer usar a nova imagem de logo (com fundo transparente, texto cursivo "Bruna Perfumaria") sem recorte circular, mantendo o formato original.

## Alteracoes

### 1. Copiar novo logo
- Copiar `user-uploads://...Editado-2.png` para `src/assets/bruna-logo.png`

### 2. `src/components/layout/Header.tsx`
- Trocar import para o novo logo
- Remover `rounded-full`, `border-2`, `border-white/30` da img
- Remover o bloco de texto "Bruna" + "Perfumaria" (o logo ja contem o nome)
- Ajustar tamanho: `h-10 md:h-12 w-auto object-contain`

### 3. `src/components/home/HeroBanner.tsx`
- Trocar import para o novo logo
- Remover `rounded-full`, `border-4`, `border-white/30` da img
- Ajustar tamanho: `h-28 md:h-40 w-auto object-contain`
- Manter animacao `animate-scale-in`

## Resultado
Logo exibido no formato original (retangular/cursivo) sobre o fundo vermelho primary, sem moldura circular.

