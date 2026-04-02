

# Carrinho menor + Animacao premium de add-to-cart + Fix build

## Alteracoes

### 1. `src/components/layout/FloatingCart.tsx`
- Reduzir botao de `h-14 w-14` para `h-12 w-12` (mesmo tamanho do WhatsApp que usa `p-3.5` ~44px)
- Reduzir icone de `h-6 w-6` para `h-5 w-5`

### 2. `src/components/product/ProductCard.tsx`
- Remover `toast.success(...)` do handleAdd
- Substituir por animacao "fly-to-cart": ao clicar no botao da cestinha, um mini-circulo com icone de sacola sobe e voa em arco ate o canto inferior direito (posicao do FloatingCart), usando framer-motion `animate` com keyframes de posicao + scale + opacity
- Implementar com um estado local `showFly` que renderiza um `motion.div` posicionado absolutamente, animado com `position: fixed` do ponto de clique ate o canto do carrinho, duracao ~600ms, ease "easeInOut"
- Ao final da animacao, dispara um pequeno "bounce" no FloatingCart (via evento custom ou contexto)

### 3. `src/components/layout/FloatingCart.tsx`
- Adicionar estado `bounce` que, quando ativado, aplica `animate={{ scale: [1, 1.2, 1] }}` no botao por ~300ms
- Expor trigger de bounce via CartContext ou evento global (`window.dispatchEvent`)

### 4. `src/pages/ProductPage.tsx`
- Mesma logica: remover toast.success, adicionar animacao fly ou ao menos um feedback visual premium (badge pulse no carrinho)

### 5. `src/pages/admin/AdminDashboard.tsx` (fix build)
- Adicionar import `import { Button } from '@/components/ui/button';` que esta faltando (linha 184 usa `Button` sem import)

### 6. `src/contexts/CartContext.tsx`
- Adicionar um evento `cart-item-added` que o FloatingCart escuta para triggerar o bounce

## Fluxo da animacao
1. Usuario clica no botao sacola do ProductCard
2. Item e adicionado ao carrinho (sem toast)
3. Um circulo animado aparece no ponto do clique e voa em arco ate o FloatingCart (~600ms)
4. Ao chegar, o FloatingCart faz um bounce rapido (scale 1→1.2→1)
5. O badge de contagem atualiza com um pequeno scale-in

## Resultado
Feedback visual premium tipo apps de e-commerce (Shein, iFood), sem toast textual que ocupa espaco e demora sumir.

