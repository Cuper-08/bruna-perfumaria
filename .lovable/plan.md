

# Redesign Premium — Bruna Perfumaria

Inspiracao: Sephora, Charlotte Tilbury, MAC Cosmetics, Boticario Premium. Lojas de beleza premium usam fundo escuro ou off-white com tipografia elegante, espacamento generoso, detalhes dourados e micro-animacoes sofisticadas.

## Diagnostico Atual

A loja parece generica porque:
- Hero e header sao um bloco vermelho solido sem profundidade
- Cards de produto sao basicos (borda + imagem + preco)
- Nao ha hierarquia visual clara — tudo tem o mesmo peso
- Footer usa o logo antigo (`bruna-logo.webp`)
- Falta seccoes de confianca (frete, pagamento, garantia)
- Categorias parecem chips genericos

## Alteracoes

### 1. `src/index.css` — Refinar tokens de cor e adicionar utilitarios premium
- Fundo principal: creme suave (`--background: 30 25% 98%`) em vez de branco puro
- Adicionar animacao `fade-up-stagger` e `glow` para efeito de brilho dourado
- Novo utilitario `.premium-divider` (linha dourada decorativa)

### 2. `src/components/layout/Header.tsx` — Header premium
- Barra superior fina com texto "Frete gratis acima de R$199" em dourado
- Header principal mais limpo: logo centralizado, nav com hover underline animado
- Sombra mais suave, backdrop-blur no scroll

### 3. `src/components/home/HeroBanner.tsx` — Hero sofisticado
- Gradiente mais profundo com overlay escuro sutil
- Tipografia maior e mais espacada
- Remover barra de busca do hero (ja tem no header)
- Adicionar CTA "Ver colecao" com botao dourado
- Shimmer divider mais largo

### 4. `src/components/home/CategoryGrid.tsx` — Categorias premium
- Cards maiores com fundo gradiente rosa-para-branco
- Icones com cor dourada em vez de vermelho
- Efeito hover com glow dourado sutil
- Titulo da secao com detalhe decorativo

### 5. `src/components/home/FeaturedProducts.tsx` — Secao de destaques
- Titulo com ornamento dourado bilateral
- Subtitulo descritivo
- Grid com gap maior para respirar

### 6. `src/components/product/ProductCard.tsx` — Card de produto premium
- Sombra mais suave e hover com elevacao
- Badge "Destaque" redesenhado com dourado
- Preco com estilo mais elegante (fonte maior, cor primary)
- Botao de adicionar com efeito de transicao mais sofisticado
- Borda quase invisivel, sombra sutil

### 7. `src/components/home/TrustBanner.tsx` (NOVO)
- Faixa entre categorias e destaques
- 3-4 icones: "Frete Gratis +R$199", "Parcele em 3x", "Produtos Originais", "Troca Facil"
- Estilo minimalista com icones finos e texto pequeno

### 8. `src/pages/Index.tsx` — Incluir TrustBanner
- Adicionar entre CategoryGrid e FeaturedProducts

### 9. `src/components/layout/Footer.tsx` — Footer atualizado
- Usar o logo correto (`bruna-logo.png`)
- Visual mais escuro e elegante
- Separador dourado

### 10. `src/components/layout/BottomNavBar.tsx` — Nav inferior premium
- Fundo com blur mais forte e borda superior dourada fina
- Icones com transicao mais suave
- Indicador ativo: ponto dourado

### 11. `src/pages/ProductPage.tsx` — Pagina de produto refinada
- Galeria com bordas arredondadas e sombra suave
- Secao de detalhes com espacamento generoso
- Botao CTA maior com efeito hover dourado
- Breadcrumb mais discreto

### 12. `src/pages/CategoryPage.tsx` — Pagina de categoria
- Header da categoria com fundo gradiente sutil
- Filtros com visual mais clean

## Arquivos

| Arquivo | Acao |
|---------|------|
| `src/index.css` | Atualizar tokens + utilitarios |
| `src/components/layout/Header.tsx` | Redesign com barra superior |
| `src/components/home/HeroBanner.tsx` | Hero premium |
| `src/components/home/CategoryGrid.tsx` | Cards com dourado |
| `src/components/home/FeaturedProducts.tsx` | Secao refinada |
| `src/components/product/ProductCard.tsx` | Card premium |
| `src/components/home/TrustBanner.tsx` | Criar novo |
| `src/pages/Index.tsx` | Adicionar TrustBanner |
| `src/components/layout/Footer.tsx` | Atualizar logo + visual |
| `src/components/layout/BottomNavBar.tsx` | Refinar nav |
| `src/pages/ProductPage.tsx` | Layout premium |
| `src/pages/CategoryPage.tsx` | Header + filtros |

## Resultado
Visual que transmite luxo e confianca — fundo creme, detalhes dourados, tipografia elegante, espacamento generoso e micro-animacoes que elevam a experiencia de compra ao nivel Sephora/Boticario.

