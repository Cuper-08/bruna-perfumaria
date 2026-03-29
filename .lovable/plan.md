

# Redesign Premium — Bruna Perfumaria

## Problema
O app esta generico e sem identidade premium. Os banners sao simples demais, nao ha barra de navegacao inferior, a logo oficial nao esta presente, e o visual geral nao transmite sofisticacao.

---

## Alteracoes

### 1. Logo Oficial no App
- Copiar a imagem da logo oficial para `src/assets/bruna-logo.png`
- Usar no Header (versao compacta, branca sobre vermelho) e na Home (hero section)
- Remover o SVG de silhueta feminina generico do Header

### 2. Remover HeroBanner de Slides — Substituir por Hero Premium
- Eliminar o carrossel de banners coloridos
- Novo Hero: fundo vermelho vibrante com a logo oficial grande centralizada, tagline elegante abaixo ("Beleza, fragrancia e cuidado"), e um search bar glassmorphism com blur
- Efeito de gradiente sutil com particulas/brilho

### 3. Bottom Navigation Bar (Glassmorphism)
- Nova `BottomNavBar.tsx` fixa no rodape mobile (390px viewport)
- 4 tabs: Home, Categorias, Em Alta, Perfil
- Estilo glassmorphism: `backdrop-blur-xl bg-white/70 border-t border-white/20`
- Icones com label, tab ativa em vermelho primary com indicador
- Esconder no desktop, mover WhatsApp button para acima da navbar no mobile

### 4. Carrinho/Cesta Flutuante
- Botao flutuante de carrinho com badge animado (substitui o icone no header em mobile)
- Posicao: canto inferior direito, acima da bottom nav
- Glassmorphism com `backdrop-blur-lg bg-primary/90 shadow-2xl`
- Ao clicar, abre mini-cart drawer (sheet) com itens + botao de finalizar

### 5. Redesign de Componentes para Premium

**CategoryGrid:**
- Scroll horizontal no mobile em vez de grid 3x2
- Cards com glassmorphism (`backdrop-blur bg-white/60`), icones mais delicados, sombras suaves
- Animacao de entrada escalonada

**FeaturedProducts:**
- Titulo com decoracao (linha dourada abaixo)
- Cards com sombra premium, hover com scale + glow sutil

**ProductCard:**
- Bordas mais arredondadas (`rounded-2xl`)
- Badge "Destaque" dourado para featured
- Preco com estilo mais elegante
- Botao de adicionar com micro-animacao

**Footer:**
- Redesign com fundo escuro premium, logo dourada, links organizados
- Padding inferior extra no mobile para nao cobrir a bottom nav

### 6. CSS / Design Tokens
- Adicionar keyframes: `slide-up`, `scale-in`, `shimmer` (efeito brilho dourado)
- Adicionar classes utilitarias glassmorphism no index.css
- Ajustar spacing global para mais respiro (padding generoso)

### 7. StoreLayout Atualizado
- Incluir `BottomNavBar` no layout
- Adicionar `pb-20` no main quando mobile para compensar a navbar
- Carrinho flutuante integrado no layout

---

## Arquivos

| Arquivo | Acao |
|---------|------|
| `src/assets/bruna-logo.png` | Copiar logo oficial |
| `src/index.css` | Glassmorphism classes, novas animacoes |
| `src/components/layout/Header.tsx` | Logo oficial, simplificar mobile |
| `src/components/layout/BottomNavBar.tsx` | NOVO — nav inferior glassmorphism |
| `src/components/layout/StoreLayout.tsx` | Integrar bottom nav + carrinho flutuante |
| `src/components/layout/FloatingCart.tsx` | NOVO — botao flutuante + mini-cart drawer |
| `src/components/layout/WhatsAppButton.tsx` | Reposicionar acima da nav |
| `src/components/layout/Footer.tsx` | Padding inferior, visual premium |
| `src/components/home/HeroBanner.tsx` | Redesign completo — hero com logo + search |
| `src/components/home/CategoryGrid.tsx` | Scroll horizontal, glassmorphism cards |
| `src/components/home/FeaturedProducts.tsx` | Decoracao premium, spacing |
| `src/components/product/ProductCard.tsx` | Rounded, sombras, badge destaque |
| `src/pages/Index.tsx` | Ajustar composicao da home |

