

# Atualizar Logo no Header — Sem Recorte Circular

## Problema
A logo atual (`bruna-logo.webp`) está sendo exibida como um círculo pequeno (9x9) com `rounded-full` e `border`. O usuário quer a logo original (imagem enviada) no formato natural, sem recorte circular, integrada com o fundo vermelho do header.

## Alterações

### 1. Copiar a nova logo para o projeto
- Copiar `user-uploads://a09916bd-...webp` para `src/assets/bruna-logo.webp` (substituir a existente)

### 2. `src/components/layout/Header.tsx`
- Remover `rounded-full`, `border-2 border-white/30`, `object-cover` da tag `<img>`
- Aumentar o tamanho da logo: `h-10 md:h-12` (sem largura fixa, mantém proporção)
- Remover o texto "Bruna" / "Perfumaria" duplicado ao lado, já que a logo já contém o nome completo
- Manter o fundo `bg-primary` (vermelho) que combina com o fundo vermelho da logo

Resultado: a logo aparece no formato original, com o desenho da mulher + texto "Bruna Perfumaria", integrada naturalmente no header vermelho.

## Arquivos
- `src/assets/bruna-logo.webp` — substituir pela imagem enviada
- `src/components/layout/Header.tsx` — ajustar classes da img e remover texto duplicado

