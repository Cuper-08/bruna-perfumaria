

# Upgrade Premium do Painel Administrativo

## Diagnostico

Analisei todas as paginas admin: Dashboard, Pedidos, Produtos, Categorias, Aparencia, Configuracoes, Login, Layout e Sidebar. O Dashboard e Produtos ja tem visual razoavel (cards com gradientes, chart, skeletons). Porem as outras paginas sao basicas demais — titulos simples, cards sem estilo, sem animacoes, sem consistencia visual.

## Problemas Identificados

1. **Layout/Header**: Header generico com texto simples "Bruna Perfumaria — Admin". Sem greeting, sem avatar, sem indicador de status da loja
2. **Sidebar**: Funcional mas sem polish — sem separadores visuais, sem badge de contagem (ex: pedidos pendentes), sem branding forte
3. **AdminOrders**: Titulo basico `text-2xl`, cards sem rounded-2xl, sem animacoes, tabs sem estilo premium, sem indicador de pedidos em tempo real visivel
4. **AdminCategories**: Pagina mais basica de todas — titulo simples, cards sem estilo, sem animacoes, sem visual premium
5. **AdminSettings**: Card unico sem separacao visual, sem icones nos campos, layout muito simples
6. **AdminAppearance**: Cards basicos, sem preview em tempo real, sem visual premium
7. **AdminLogin**: Razoavel mas poderia ter mais polish

## Alteracoes Propostas

### 1. `src/components/admin/AdminLayout.tsx` — Header Premium
- Substituir texto estatico por greeting dinamico ("Bom dia, Admin" baseado na hora)
- Adicionar badge de status da loja (Aberta/Fechada) com dot animado
- Adicionar badge com contagem de pedidos pendentes (pulsante)
- Background com sutil gradiente ou borda inferior dourada

### 2. `src/components/admin/AdminSidebar.tsx` — Sidebar Premium
- Adicionar badge de contagem nos itens "Pedidos" (pedidos pendentes) 
- Separadores visuais entre grupos (navegacao principal vs configuracoes)
- Hover com highlight mais marcante (borda lateral dourada no item ativo)
- Logo com fundo sutil quando expandida

### 3. `src/pages/admin/AdminOrders.tsx` — Pedidos Premium
- Titulo com mesmo padrao do Dashboard (text-4xl font-display + subtitulo)
- Cards com rounded-2xl, hover shadow, border-bruna-gold/50 no hover
- Tabs com estilo pill/rounded em vez do default
- Animacao fade-in nos cards (stagger)
- Contador de pedidos por status mais visivel
- Separador visual entre header e conteudo

### 4. `src/pages/admin/AdminCategories.tsx` — Categorias Premium
- Titulo com mesmo padrao (text-4xl font-display + subtitulo)
- Cards com imagem/icone visual, rounded-2xl, hover effects
- Botoes estilizados como nos Produtos (bg-bruna-dark hover:bg-bruna-red)
- Animacao stagger nos cards
- Empty state premium (como em Produtos)
- Barra de separacao visual header/conteudo

### 5. `src/pages/admin/AdminSettings.tsx` — Configuracoes Premium
- Titulo com padrao premium (text-4xl + subtitulo)
- Separar em secoes com icones (como Aparencia ja faz)
- Cards com rounded-2xl, icones coloridos nos headers
- Switch com label mais descritivo
- Inputs com icones (Phone, MapPin)
- Botao salvar com estilo premium (bg-bruna-dark)

### 6. `src/pages/admin/AdminAppearance.tsx` — Aparencia Premium
- Titulo com padrao premium
- Cards com rounded-2xl, borders sutis
- Icones com cores mais vibrantes
- Botao salvar com estilo bruna-dark
- Secoes com separadores visuais

### 7. `src/pages/admin/AdminLogin.tsx` — Login Polish
- Gradiente mais marcante no background
- Card com rounded-2xl e borda sutil dourada
- Botao com estilo bruna-dark
- Animacao fade-in no card

## Detalhes Tecnicos

- Usar `animate-fade-in` do Tailwind config existente para stagger animations
- Padronizar todos os titulos: `text-4xl font-display font-bold tracking-tight text-bruna-dark dark:text-bruna-cream` + subtitulo `text-muted-foreground mt-2 text-lg`
- Padronizar cards: `rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all`
- Padronizar botoes principais: `bg-bruna-dark hover:bg-bruna-red text-white shadow-md hover:shadow-lg`
- Header: query de pedidos pendentes + store_open via Supabase
- Sidebar badges: query count de pedidos com status `received`

## Arquivos Modificados

| Arquivo | Acao |
|---------|------|
| `src/components/admin/AdminLayout.tsx` | Header premium com greeting + badges |
| `src/components/admin/AdminSidebar.tsx` | Badges de contagem + visual polish |
| `src/pages/admin/AdminOrders.tsx` | Visual premium consistente |
| `src/pages/admin/AdminCategories.tsx` | Redesign premium completo |
| `src/pages/admin/AdminSettings.tsx` | Visual premium + icones |
| `src/pages/admin/AdminAppearance.tsx` | Polish visual |
| `src/pages/admin/AdminLogin.tsx` | Polish visual |

## Resultado
Painel admin com visual coeso, premium, e profissional em todas as paginas — consistente com o nivel do Dashboard e Produtos que ja estao mais avancados.

