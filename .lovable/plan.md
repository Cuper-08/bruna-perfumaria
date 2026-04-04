

# Fix: Toast fantasma no ProductPage + Scroll to Top

## Problemas

1. **Toast "adicionado ao carrinho"** aparece na ProductPage ao adicionar item. O texto nao existe no codigo atual — provavelmente e cache do navegador de uma versao anterior. Porem, o `handleAdd` da ProductPage tambem nao tem a animacao fly-to-cart que ja existe no ProductCard. Solucao: adicionar a mesma animacao FlyingDot + checkmark visual na ProductPage.

2. **Scroll para o footer** ao clicar "Finalizar Pedido" — nao existe um componente ScrollToTop global. Quando o usuario navega de qualquer rota para outra, o React Router nao faz scroll automatico.

## Alteracoes

### 1. `src/pages/ProductPage.tsx`
- Adicionar a mesma logica de fly-to-cart do ProductCard: importar `createPortal`, `motion`, `useRef`
- Criar componente `FlyingDot` (igual ao do ProductCard) ou extrair para arquivo compartilhado
- No `handleAdd`: capturar posicao do botao, disparar animacao fly, mostrar checkmark temporario no botao
- Adicionar estados `flying`, `flyPos`, `added` e `btnRef`
- Substituir o botao estatico por um com AnimatePresence (check/bag icon swap)

### 2. `src/components/ScrollToTop.tsx` (novo)
- Componente que escuta `useLocation().pathname` e faz `window.scrollTo(0, 0)` em cada mudanca de rota

### 3. `src/App.tsx`
- Importar e renderizar `<ScrollToTop />` dentro do `<BrowserRouter>`, antes do `<Routes>`

## Resultado
- Ao adicionar produto na ProductPage, aparece a animacao fly-to-cart em vez de toast
- Ao navegar para qualquer pagina (incluindo /carrinho e /checkout), o scroll vai para o topo automaticamente

