

# Suavizar Degradê do Hero Banner

## Problema
O degradê do hero tem uma transição muito forte para branco/rosa claro, criando um contraste visual desagradável.

## Alteração

**`src/components/home/HeroBanner.tsx`:**
- Trocar o gradiente `from-primary via-primary to-bruna-rose/80` por um degradê mais sutil e uniforme: `from-primary via-primary/95 to-primary/85`
- Isso mantém o vermelho dominante com uma leve variação de tom, sem o branco forte
- A barra de busca glassmorphism também será suavizada: reduzir `bg-white/70` para `bg-white/25` com texto branco, mantendo o blur mas sem o contraste branco pesado

## Arquivos
- `src/components/home/HeroBanner.tsx` — gradiente + search bar
- `src/index.css` — ajustar classe `.glass` se necessário para variante mais sutil

