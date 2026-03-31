

# Ícones de Categorias — Visual Premium e Marcante

## Problema
Os ícones atuais (Lucide padrão) são genéricos e simples demais. Parecem um app básico, não premium.

## Solução
Redesenhar os cards de categoria com visual premium: ícones maiores com gradiente, fundo com efeito glassmorphism mais sofisticado, e um toque de sombra/brilho que transmita luxo.

## Alterações em `src/components/home/CategoryGrid.tsx`

### 1. Trocar ícones por versões mais expressivas do Lucide
- `Sparkles` → `Gem` (perfumes — joia/preciosidade)
- `Palette` → `Brush` (maquiagem — pincelada artística)
- `Scissors` → `Wind` (cabelo — movimento/leveza)
- `Heart` → `HeartHandshake` ou `Flower2` (corpo — cuidado/floral)
- `Droplets` → `Leaf` (skincare — natureza/frescor)
- `Leaf` → `ShieldCheck` (higiene — proteção/confiança)

### 2. Redesenhar o card de cada categoria
- Fundo do ícone: gradiente sutil vermelho→rosa (`bg-gradient-to-br from-primary/15 to-pink-200/30`)
- Ícone maior: `h-6 w-6` com `strokeWidth={1.5}` (traço mais fino = elegância)
- Card com sombra suave e borda fina semi-transparente (`shadow-sm border border-white/60`)
- Hover: escala sutil (`scale-105`) + sombra mais intensa + brilho no fundo do ícone
- Nome da categoria com `text-xs tracking-wide` para sensação tipográfica refinada

### 3. Título da seção
- Manter "Categorias" mas com estilo mais discreto/premium

## Resultado
Cards de categoria com aspecto sofisticado — ícones elegantes com traço fino, gradientes sutis, e transições suaves que passam a sensação de app de luxo.

