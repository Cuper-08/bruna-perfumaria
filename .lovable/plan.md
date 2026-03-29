

# Bruna Perfumaria — Fase 1: Banco de Dados + Design System + Layout + Carrinho + Home

Este é o primeiro passo de implementação. Vamos construir a fundação completa do app.

---

## O que será construído agora

### 1. Banco de Dados (Migration)
Criar toda a estrutura em uma única migration:

- **Enums:** `payment_method_type`, `payment_status_type`, `order_status_type`, `app_role`
- **Tabelas:** `categories`, `products`, `orders`, `admin_settings`, `user_roles`
- **RLS:** Políticas de segurança para cada tabela
- **Função:** `has_role()` SECURITY DEFINER para verificar admin
- **Storage:** Bucket `product-images` público
- **Seed:** Inserir categorias iniciais (Perfumes, Maquiagem, Cabelo, Corpo, Skincare, Higiene) e configurações padrão (taxa entrega R$5, loja aberta)

### 2. Design System
- Atualizar `index.html` com Google Fonts (Playfair Display + Inter)
- Atualizar `src/index.css` com paleta Bruna: primary vermelho (#C41E2E), acentos rosa/dourado, fundo off-white
- Estilos de impressão térmica 80mm via `@media print`

### 3. Layout Base
- `StoreLayout.tsx` — wrapper com Header + Footer + WhatsApp flutuante
- `Header.tsx` — logo "Bruna Perfumaria" cursiva, navegação por categorias, badge do carrinho
- `Footer.tsx` — endereço, telefone, horários
- `WhatsAppButton.tsx` — botão flutuante verde

### 4. Carrinho (Context + localStorage)
- `CartContext.tsx` — add, remove, updateQuantity, clear, total, itemCount
- Persistência em localStorage com expiração de 7 dias

### 5. Páginas do Cliente (Início)
- **Home (Index.tsx)** — Hero banner, grid de categorias, produtos em destaque
- **CategoryPage.tsx** — Grid de produtos filtrados, busca, ordenação
- **ProductPage.tsx** — Galeria, detalhes, adicionar ao carrinho
- **CartPage.tsx** — Lista editável, subtotal, total, botão finalizar

### 6. Componentes de Suporte
- `HeroBanner.tsx`, `CategoryGrid.tsx`, `FeaturedProducts.tsx`
- `ProductCard.tsx`, `ProductGallery.tsx`

### 7. Rotas Iniciais (App.tsx)
```text
/                  → Home
/categoria/:slug   → CategoryPage
/produto/:slug     → ProductPage
/carrinho          → CartPage
```

### 8. Dependências
- `canvas-confetti` (para uso posterior na confirmação)
- `react-input-mask` (para uso posterior no checkout)

---

## Detalhes Técnicos

- Produtos sem dados reais inicialmente (busca do Supabase, exibe "Nenhum produto" se vazio)
- Categorias carregadas do banco (já com seed)
- Carrinho 100% client-side com localStorage
- Layout mobile-first responsivo
- Cores em HSL no CSS variables seguindo padrão Shadcn

