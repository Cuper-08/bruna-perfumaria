

# Painel Administrativo Completo e Profissional

Este e um upgrade massivo do painel admin. Vou dividir em blocos logicos.

## Resumo das entregas

1. **Nova tabela `store_customization`** para armazenar textos editaveis da hero, footer, promo bar, WhatsApp
2. **Aba "Aparencia" no admin** — editar hero (titulo, subtitulo, CTA), footer (endereco, horarios), promo bar (texto), numero do WhatsApp
3. **Aba "Categorias" no admin** — CRUD completo de categorias
4. **Cadastro em massa via planilha** — upload de .xlsx/.csv na tela de produtos, parse no frontend, insert em batch
5. **Pedidos: edicao de itens** — dialog para editar itens/quantidades de um pedido
6. **Pedidos: botao WhatsApp** — link direto para o WhatsApp do cliente no pedido
7. **Pedidos: impressao em lista** — botao para imprimir lista de pedidos filtrados (termica 80mm)
8. **WhatsApp button com pulsar medio** — animacao CSS suave no botao flutuante
9. **Dados dinamicos no app** — Hero, Footer, WhatsApp, promo bar leem da tabela `store_customization` em vez de hardcoded

---

## Detalhes tecnicos

### Migration: nova tabela `store_customization`

```sql
CREATE TABLE public.store_customization (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text DEFAULT 'Beleza, fragrancia e cuidado',
  hero_subtitle text DEFAULT 'Qualidade e beleza em um so lugar.',
  hero_cta_text text DEFAULT 'Ver Colecao',
  hero_cta_link text DEFAULT '/categoria/perfumes',
  promo_bar_text text DEFAULT 'Frete gratis acima de R$199 . Parcele em ate 3x',
  whatsapp_number text DEFAULT '5511945778994',
  whatsapp_message text DEFAULT 'Ola! Vim pelo app da Bruna Perfumaria',
  footer_address text DEFAULT 'Av. Olavo Egidio, 1570 - Tucuruvi, Sao Paulo - SP',
  footer_phone text DEFAULT '(11) 94577-8994',
  footer_hours jsonb DEFAULT '{"weekdays":"Segunda a Sexta: 8h as 20h","saturday":"Sabado: 8h as 18h","sunday":"Domingo: Fechado"}'
);

-- RLS
ALTER TABLE public.store_customization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view" ON public.store_customization FOR SELECT TO public USING (true);
CREATE POLICY "Admins can update" ON public.store_customization FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Seed row
INSERT INTO public.store_customization DEFAULT VALUES;
```

### Arquivos novos

| Arquivo | Descricao |
|---------|-----------|
| `src/pages/admin/AdminAppearance.tsx` | Aba "Aparencia" — form para editar hero, footer, promo bar, WhatsApp |
| `src/pages/admin/AdminCategories.tsx` | CRUD de categorias (nome, slug, icone, ordem, ativo) |
| `src/components/admin/BulkProductUpload.tsx` | Dialog para upload de planilha (.xlsx/.csv), preview e import em batch |
| `src/components/admin/OrderEditDialog.tsx` | Dialog para editar itens/quantidades de um pedido existente |
| `src/components/admin/OrderListPrint.tsx` | Componente de impressao de lista de pedidos (80mm) |
| `src/hooks/useStoreCustomization.ts` | Hook com TanStack Query para buscar dados da `store_customization` |

### Arquivos modificados

| Arquivo | Mudanca |
|---------|---------|
| `src/App.tsx` | Adicionar rotas `/admin/aparencia` e `/admin/categorias` |
| `src/components/admin/AdminSidebar.tsx` | Adicionar links "Aparencia" e "Categorias" |
| `src/components/home/HeroBanner.tsx` | Ler textos de `useStoreCustomization` em vez de hardcoded |
| `src/components/layout/Footer.tsx` | Ler endereco/telefone/horarios de `useStoreCustomization` |
| `src/components/layout/StoreLayout.tsx` | Ler promo bar text de `useStoreCustomization` |
| `src/components/layout/WhatsAppButton.tsx` | Ler numero de `useStoreCustomization` + animacao pulsar medio |
| `src/pages/admin/AdminProducts.tsx` | Adicionar botao "Importar Planilha" que abre `BulkProductUpload` |
| `src/pages/admin/AdminOrders.tsx` | Adicionar botao WhatsApp no pedido, botao editar itens, botao imprimir lista |
| `src/index.css` | Adicionar keyframe `pulse-medium` para WhatsApp |

### Logica do Bulk Upload

1. Usuario faz upload de .xlsx ou .csv
2. Frontend usa `xlsx` (SheetJS) para parsear
3. Preview em tabela com validacao (titulo, preco obrigatorios)
4. Botao "Importar X produtos" faz batch insert via Supabase
5. Gera slug automaticamente para cada produto

### Logica de edicao de pedido

1. Admin clica "Editar" no pedido
2. Dialog mostra itens editaveis (quantidade, remover item)
3. Recalcula subtotal/total automaticamente
4. Salva via update no Supabase

### WhatsApp no pedido

Botao verde ao lado de cada pedido que abre `https://wa.me/{customer_phone}?text=Ola {customer_name}, sobre seu pedido #{order_number}...`

### Impressao de lista de pedidos

Botao "Imprimir Lista" no topo da aba pedidos — gera layout otimizado para termica 80mm com todos os pedidos do filtro atual (status ativo), formatado como lista compacta.

### Pulsar medio no WhatsApp

```css
@keyframes pulse-medium {
  0%, 100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.5); }
  50% { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
}
```
Aplicado como `animate-[pulse-medium_2.5s_ease-in-out_infinite]`.

---

## Resultado

Painel admin completo com: gestao de aparencia do app, categorias, produtos com import em massa, pedidos com edicao/WhatsApp/impressao, e todos os dados do app editaveis sem tocar em codigo.

