

# Redesign Compacto + Realtime Fix + Icones Corretos para Pedidos

## Problemas Identificados

1. **Realtime nao funciona**: O codigo ja tem `supabase.channel('admin-orders')` com listener de INSERT/UPDATE, mas o Realtime precisa estar habilitado na tabela `orders` no Supabase. Alem disso, falta um fallback de polling periodico caso o canal falhe.

2. **Icone ChefHat errado**: Usado em "Aceitar Pedido" (linha 112) e na timeline "Preparando" (linha 87). Inapropriado para loja de beleza. Substituir por `Sparkles` ou `PackageCheck` (empacotando).

3. **Layout muito espalhado**: Cada card ocupa espaco excessivo com timeline, tabela de itens expandida, totais, e info do cliente — tudo aberto simultaneamente. Para fluxo rapido de pedidos, precisa ser compacto.

## Alteracoes em `src/pages/admin/AdminOrders.tsx`

### Fix Realtime
- Adicionar polling de fallback a cada 30s com `setInterval` (caso websocket falhe)
- Melhorar o subscribe com callback de status para detectar erros de conexao
- Adicionar `.eq('table', 'orders')` no filter para garantir escopo

### Icones Corretos (beleza)
- `ChefHat` → `Sparkles` em todos os lugares (timeline step "Preparando", botao "Aceitar", tabs)
- Botao "Aceitar Pedido" → icone `PackageCheck` com label "Aceitar Pedido"
- Timeline: Novo(`Package`) → Preparando(`Sparkles`) → Entrega(`Truck`) → Entregue(`CheckCircle`)

### Layout Compacto Premium
- **Remover timeline expandida** dos cards — substituir por mini-dots inline (4 circulos pequenos no header do card, sem labels)
- **Colapsar tabela de itens**: mostrar apenas resumo inline ("3 itens • R$ 89,90") com expand/collapse opcional via `Collapsible`
- **Info do cliente**: uma unica linha compacta (nome + telefone + bairro) em vez de card separado
- **Totais**: linha unica "Total: R$ X" em bold, sem subtotal/entrega visivel (apenas no expand)
- **Acoes**: manter na mesma linha do total, mais compactas
- **Resultado**: cada card ocupa ~120px de altura em vez de ~400px

### Estrutura do Card Compacto
```text
┌─[●●○○]──#9 NOVO──────────Test User──────Total R$ 43,71──[Aceitar]─[⋯]─┐
│  10 abr 16:22   1 item • Dinheiro na Entrega   Tucuruvi              │
└──────────────────────────────────────────────────────────────────────────┘
```
- Header: mini-dots de progresso + numero + status badge + nome + total + acoes
- Subline: data + resumo itens + metodo pagamento + bairro
- Click no card ou botao "ver mais" expande detalhes (itens, endereco completo, totais discriminados)

### Expand/Collapse
- Usar `Collapsible` do shadcn para detalhes
- Estado controlado por `expandedOrders: Set<string>`
- Clicar no card toggle expanded

## Arquivos

| Arquivo | Acao |
|---------|------|
| `src/pages/admin/AdminOrders.tsx` | Redesign compacto + fix realtime + icones |

## Resultado
- Pedidos aparecem automaticamente sem reload (realtime + polling fallback)
- Icones adequados para loja de beleza
- Cards compactos que mostram info essencial em 2 linhas, expandindo sob demanda
- Fluxo de gestao muito mais rapido e limpo

