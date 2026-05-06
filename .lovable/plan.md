## Aplicar ícones premium das categorias

Os 6 ícones já foram gerados via Lovable AI inspirados na sua imagem do Gemini, otimizados em WebP (~10–22 KB cada) e estão em `src/assets/categories/`:
`perfumes.webp`, `maquiagem.webp`, `cabelo.webp`, `corpo.webp`, `skincare.webp`, `higiene.webp`.

### Mudanças

**1. `src/lib/category-icons.ts` (criar)**
Helper central com mapa `slug → imagem` (com aliases) e função `getCategoryImage(slug)` retornando `string | undefined`.

**2. `src/pages/CategoriesPage.tsx` (editar)**
Novo card premium estilo Sephora:
- `aspect-[4/3]`, imagem em `object-cover` ocupando o card inteiro
- Gradiente `from-black/70 via-black/10 to-transparent` no rodapé
- Nome em overlay branco (font-display, semibold)
- Pill glassmorphism no topo direito com a contagem de produtos
- Hover: `group-hover:scale-105` na imagem
- Fallback: se `getCategoryImage(slug)` retornar undefined, mantém o card antigo com ícone Lucide e gradiente colorido (categorias futuras criadas pelo admin continuam funcionando)

**3. `src/components/home/CategoryGrid.tsx` (editar)**
- Substituir o quadrado de ícone Lucide pela thumbnail `w-14 h-14 rounded-2xl overflow-hidden` com a imagem da categoria
- Manter label compacto embaixo, animações e grid 3×6
- Fallback Lucide preservado

### Resultado
- `/categorias` ganha visual de revista de beleza com fotografia real
- Home ganha mini-cards muito mais ricos sem perder densidade
- ~110 KB total de imagens, lazy via Vite, zero impacto runtime
