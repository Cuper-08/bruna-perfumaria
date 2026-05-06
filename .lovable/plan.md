# Header com botão "Voltar" em todas as páginas internas

## Problema diagnosticado (end-to-end)

Fiz uma varredura em todas as páginas da loja e confirmei o que você viu no print:

| Página | Botão de voltar no topo? |
|---|---|
| `/carrinho` (CartPage) | ❌ Não |
| `/produto/:slug` (ProductPage) | ❌ Não |
| `/categorias` (CategoriesPage) | ❌ Não |
| `/categoria/:slug` (CategoryPage) | ❌ Não |
| `/busca` (SearchPage) | ❌ Não |
| `/destaques` (TrendingPage) | ❌ Não |
| `/pedido/:id` (OrderConfirmation) | ❌ Não |
| `/privacidade`, `/termos` | ❌ Não |
| `/checkout` | ✅ Sim (único que tem) |

**Causa raiz:** o `StoreLayout` renderiza apenas a barra promocional (marquee) + `main` + `Footer` + `BottomNavBar`. Não existe um header global. A bottom nav tem ícones de Home/Categorias/Destaques/Carrinho, mas nenhum botão de "voltar" contextual.

Resultado: quando o cliente entra no carrinho (ou em qualquer subpágina), a única forma de voltar é apertar o botão físico do navegador ou clicar em "Home" na bottom nav — nada intuitivo dentro do app, especialmente como PWA instalado.

## Solução

Criar um componente reutilizável `PageHeader` com botão de voltar + título, e usar nas páginas internas. Manter a Home (`/`) sem header (lá já existe a estrutura própria com logo, busca, etc.).

### 1. Novo componente `src/components/layout/PageHeader.tsx`

- Sticky no topo (`sticky top-0 z-40`), abaixo da promo bar.
- Fundo glassmorphism: `bg-white/85 backdrop-blur-xl` + borda inferior sutil dourada (`border-accent/15`).
- Botão circular à esquerda com `ArrowLeft`:
  - Comportamento inteligente: se `window.history.length > 1` → `navigate(-1)`; senão fallback para `/`.
  - Tamanho 40×40, hover suave, área de toque confortável para mobile.
- Título centralizado opcional (font-display, peso semibold, truncate).
- Slot opcional à direita para ações (ex.: ícone de carrinho na ProductPage).
- Respeita `env(safe-area-inset-top)` para iOS notch quando instalado como PWA.

### 2. Integrar nas páginas

Adicionar `<PageHeader title="..." />` no topo de cada página que usa `StoreLayout`:

- **CartPage** → título "Carrinho" (remover `<h1>` redundante interno).
- **ProductPage** → sem título (deixa a foto do produto respirar), mas mostra botão voltar + ícone de carrinho à direita.
- **CategoriesPage** → "Categorias".
- **CategoryPage** → nome da categoria atual.
- **SearchPage** → "Buscar".
- **TrendingPage** → "Em Alta".
- **OrderConfirmationPage** → "Pedido Confirmado" (botão voltar leva para `/`, não history).
- **PrivacyPage** → "Privacidade".
- **TermsPage** → "Termos de Uso".

### 3. Não mexer

- `CheckoutPage` já tem seu próprio header com voltar — manter como está.
- `Index` (home) — não recebe header (é a raiz).
- Bottom nav, Footer, promo bar — inalterados.

## Detalhes técnicos

```text
[ promo bar marquee                       ]
[ ◀  Carrinho                       (🛒) ]  ← novo PageHeader (sticky)
[ ...conteúdo da página...                ]
[ Footer                                  ]
[ Bottom Nav (fixed)                      ]
```

- Lógica do voltar:
  ```ts
  const navigate = useNavigate();
  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };
  ```
- Acessibilidade: `aria-label="Voltar"` no botão, foco visível.
- Mobile-first: padding horizontal `px-4`, altura `h-14`, título truncado em telas pequenas.

## Arquivos

| Arquivo | Ação |
|---|---|
| `src/components/layout/PageHeader.tsx` | Criar |
| `src/pages/CartPage.tsx` | Adicionar PageHeader, remover h1 duplicado |
| `src/pages/ProductPage.tsx` | Adicionar PageHeader (sem título, com ação carrinho) |
| `src/pages/CategoriesPage.tsx` | Adicionar PageHeader |
| `src/pages/CategoryPage.tsx` | Adicionar PageHeader com nome dinâmico |
| `src/pages/SearchPage.tsx` | Adicionar PageHeader |
| `src/pages/TrendingPage.tsx` | Adicionar PageHeader |
| `src/pages/OrderConfirmationPage.tsx` | Adicionar PageHeader |
| `src/pages/PrivacyPage.tsx` | Adicionar PageHeader |
| `src/pages/TermsPage.tsx` | Adicionar PageHeader |

## Resultado

Em qualquer página interna, o cliente vê no topo um botão circular ◀ que o leva de volta — exatamente como apps nativos (iFood, Shopee, Sephora). Solução consistente, premium e responsiva, alinhada à paleta atual (off-white + dourado + vermelho).
