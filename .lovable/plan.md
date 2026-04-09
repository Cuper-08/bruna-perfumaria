

# Redesign Premium da Pagina de Pedidos (AdminOrders)

## Problema
A pagina de pedidos esta funcional mas com visual "comum" — cards sem profundidade, header sem destaque, summary cards pequenos, tabela de itens sem refinamento, e acoes sem hierarquia visual clara. Comparada ao Dashboard (que ja tem gradientes, chart, cards com hover effects), a pagina de pedidos precisa do mesmo nivel de polish.

## Alteracoes em `src/pages/admin/AdminOrders.tsx`

### Header
- Adicionar contador total de pedidos ao lado do titulo com badge dourado
- Subtitulo com dot animado verde "ao vivo" indicando tempo real
- Botao "Imprimir" com estilo mais refinado + badge com contagem de pedidos filtrados

### Summary Cards (grid de status)
- Aumentar para `gap-3` com `p-4`
- Adicionar gradiente sutil no background de cada card (ex: `bg-gradient-to-br from-sky-50 to-white`)
- Numero maior (`text-3xl`) com animacao de contagem
- Borda inferior colorida no card ativo em vez de borda completa
- Adicionar sutil "ring" glow no card ativo

### Tabs
- Remover a TabsList duplicada (ja temos os summary cards como filtro) — manter apenas como navegacao secundaria mais compacta, ou transformar em pills horizontais minimalistas

### Order Cards — Redesign completo
- **Header do card**: Layout em 2 colunas claras — esquerda (numero + status + data), direita (pagamento badges)
- **Timeline visual**: Adicionar uma mini progress bar horizontal mostrando em qual etapa o pedido esta (Recebido > Preparando > Entrega > Entregue) com dots coloridos
- **Info do cliente**: Card interno com avatar placeholder (iniciais do nome em circulo colorido), nome, telefone, endereco — tudo em layout limpo
- **Tabela de itens**: Zebra striping sutil, fonte mais legivel, coluna de valor com destaque
- **Totais**: Card com fundo gradiente sutil (`bg-gradient-to-r from-muted/30 to-muted/10`), total com tamanho maior e cor dourada
- **Acoes**: Botao principal com gradiente (em vez de cor solida), icones secundarios com tooltip, separador visual entre acao principal e secundarias

### Detalhes visuais globais
- Stagger animation nos cards (ja existe, manter)
- Hover no card: sutil elevacao + borda dourada (`hover:border-bruna-gold/30`)
- Empty state: ilustracao maior, texto mais descritivo, animacao sutil

### Timeline Progress (novo componente inline)
Para cada pedido, uma barra horizontal com 4 steps:
```text
[●]───[●]───[○]───[○]
Novo  Prep  Entrega Entregue
```
- Steps completados: dot preenchido + linha colorida
- Step atual: dot com ring/pulse
- Steps futuros: dot vazio + linha cinza

## Arquivos

| Arquivo | Acao |
|---------|------|
| `src/pages/admin/AdminOrders.tsx` | Redesign premium completo |

## Resultado
Pagina de pedidos com visual no mesmo nivel do Dashboard — cards com profundidade, timeline de progresso, hierarquia visual clara, e interacoes refinadas.

