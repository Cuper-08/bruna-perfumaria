

# Painel Admin — Gestao de Pedidos (Estilo Bebidas Ja!)

## Visao Geral

Construir o painel administrativo completo com foco na gestao de pedidos em tempo real. Inclui login admin, layout com sidebar, e a tela principal de pedidos com notificacao sonora, impressao termica e Supabase Realtime.

---

## Arquivos a Criar

### 1. `src/contexts/AdminAuthContext.tsx`
- Provider com `useAdminAuth()` hook
- Login via `supabase.auth.signInWithPassword()`
- Verifica role admin via RPC `has_role(auth.uid(), 'admin')`
- Componente `AdminRoute` que redireciona para `/admin/login` se nao autenticado/admin

### 2. `src/pages/admin/AdminLogin.tsx`
- Formulario email + senha, estilo premium com logo Bruna
- Chama signIn do context, verifica role, redireciona para `/admin`

### 3. `src/components/admin/AdminLayout.tsx`
- Shadcn SidebarProvider + Sidebar com links: Dashboard, Pedidos, Produtos, Categorias, Config
- Header com SidebarTrigger + nome usuario + logout
- Wraps children com AdminRoute guard

### 4. `src/components/admin/AdminSidebar.tsx`
- Sidebar com icones Lucide, NavLink para highlight ativo
- Items: Dashboard (`/admin`), Pedidos (`/admin/pedidos`), Produtos (`/admin/produtos`), Config (`/admin/config`)

### 5. `src/pages/admin/AdminDashboard.tsx`
- Cards resumo: Pedidos Hoje, Receita do Dia, Pedidos Pendentes, Total Produtos
- Lista rapida dos ultimos 5 pedidos

### 6. `src/pages/admin/AdminOrders.tsx` — **FOCO PRINCIPAL**

**Filtros:** Tabs por status (Todos, Novo, Preparando, Em Entrega, Entregue, Cancelado)

**Card de cada pedido mostra:**
- Numero do pedido + horario
- Nome do cliente, telefone (com link `tel:`), endereco completo (do JSONB)
- Lista de itens com quantidade x preco unitario
- Subtotal + taxa de entrega + total
- Badge de pagamento: metodo (PIX/Cartao/Dinheiro/Cartao entrega) + status (PAGO verde / PAGAMENTO NA ENTREGA amarelo / PENDENTE vermelho)
- Se `payment_method = dinheiro_entrega` e `needs_change = true`: exibe "Troco para R$ {change_for}"
- Botao "Imprimir" — abre print dialog com layout 80mm
- Botoes de acao sequenciais: Aceitar → Preparando → Saiu para Entrega → Entregue (cada botao so aparece no status correto)

**Supabase Realtime:**
- Subscribe no canal `public:orders` (INSERT + UPDATE)
- Novo pedido: toca som de notificacao + toast
- Update: atualiza lista automaticamente

**Som de notificacao:**
- Audio element com mp3 embutido (data URI ou arquivo em public/)
- Dispara em `INSERT` events do realtime

**Impressao termica 80mm:**
- CSS `@media print` com largura fixa 80mm
- Layout: logo pequena, numero pedido, data/hora, itens, totais, endereco, forma pagamento
- Esconde tudo exceto o recibo na impressao

### 7. `src/components/admin/OrderReceiptPrint.tsx`
- Componente dedicado para o layout do recibo termico
- Props: order data
- Styled para 80mm com fonte mono, sem margens

### 8. `public/notification.mp3`
- Som curto de notificacao para novos pedidos

## Arquivos a Editar

### `src/App.tsx`
- Adicionar rotas:
```
/admin/login    → AdminLogin
/admin          → AdminLayout > AdminDashboard
/admin/pedidos  → AdminLayout > AdminOrders
```
- Wraps admin routes com AdminAuthContext provider

## Detalhes Tecnicos

- **Realtime:** `supabase.channel('orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)`
- **Status update:** `supabase.from('orders').update({ order_status: newStatus }).eq('id', orderId)` — requer admin autenticado (RLS ja cobre)
- **Sem migration necessaria** — tabelas, enums e policies ja existem
- **Print CSS:** adicionar em index.css regras `@media print` que escondem sidebar/header e mostram apenas o recibo com largura 80mm

