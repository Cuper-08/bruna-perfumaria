

# Mover Carrinho para BottomNavBar

## Resumo
Substituir o tab "Perfil" na barra inferior pelo carrinho (cestinha), que abre o Sheet lateral com os itens. Remover o FloatingCart flutuante.

## Alteracoes

### 1. `src/components/layout/BottomNavBar.tsx`
- Remover tab "Perfil" (User icon, `/perfil`)
- Adicionar tab "Cesta" com icone `ShoppingBag` no lugar
- Em vez de `<Link>`, esse tab sera um `<button>` que abre o Sheet do carrinho (mesma logica do FloatingCart)
- Importar `useCart` para mostrar badge com `itemCount` sobre o icone
- Importar Sheet + conteudo do carrinho do FloatingCart
- Manter bounce animation via evento `cart-item-added`

### 2. `src/components/layout/StoreLayout.tsx`
- Remover `<FloatingCart />` do layout

### 3. `src/components/layout/FloatingCart.tsx`
- Arquivo pode ser mantido mas nao sera mais usado (ou deletado)

## Resultado
Carrinho integrado na barra inferior no lugar do Perfil, sem botao flutuante separado. Badge de contagem visivel sobre o icone da cestinha.

