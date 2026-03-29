

# Ajuste de Identidade Visual — Bruna Perfumaria

## Problema
A cor atual (`#C41E2E` — vermelho escuro/frio) nao corresponde a fachada da loja, que usa um **vermelho vibrante rosado** mais quente e luminoso. O header tambem nao reproduz a logo cursiva com a silhueta feminina.

## Alteracoes

### 1. Paleta de Cores (src/index.css)
Ajustar o primary e tokens customizados para o vermelho vibrante da fachada (aprox. `#E52535` — HSL `355 78% 52%`), mais quente e luminoso. Ajustar rosa e rose para complementar.

### 2. Header com Logo Fiel (src/components/layout/Header.tsx)
- Fundo do header em **vermelho primary** (como a fachada) com texto/icones brancos
- Logo "Bruna" em fonte cursiva branca com "Perfumaria" abaixo, reproduzindo o estilo da fachada
- Adicionar um SVG simplificado da silhueta feminina ao lado do logo
- Menu e carrinho em branco

### 3. Hero Banner (src/components/home/HeroBanner.tsx)
- Gradientes mais vibrantes usando a nova paleta, mantendo a energia da marca

### 4. CategoryGrid (src/components/home/CategoryGrid.tsx)
- Cards com fundo rosa claro e icones no vermelho vibrante, reforçando a identidade

### 5. Copiar imagem da fachada (opcional)
- Salvar imagem uploadada em `src/assets/bruna-fachada.png` para referencia futura

## Arquivos Editados
- `src/index.css` — nova paleta HSL
- `src/components/layout/Header.tsx` — header vermelho com logo branca + silhueta
- `src/components/home/HeroBanner.tsx` — gradientes atualizados
- `src/components/home/CategoryGrid.tsx` — styling refinado

