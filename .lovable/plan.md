# Logo Oficial nos Ícones do PWA — Responsivo, Moderno e Fiel à Marca

## Status atual do PWA

Sim, o PWA **já está ativo** neste projeto:
- `public/manifest.json` configurado com `display: standalone`, `theme_color` e `background_color` `#1a1a2e`.
- `index.html` com `<link rel="manifest">`, `apple-touch-icon`, `apple-mobile-web-app-capable` e `theme-color`.
- Ícones existentes em `public/icons/` (192, 512 e apple-touch 180).

O que **não está bom**: os ícones atuais foram gerados anteriormente como um fundo gradiente vermelho/azul com efeito "glassmorphism", mas a logo real da Bruna Perfumaria (`src/assets/bruna-logo.png`, 593×421) ainda não está aplicada de forma fiel — fica pequena, desalinhada e desaparece no recorte circular/squircle que o Android e o iOS aplicam.

## Objetivo

Refazer os 3 ícones do PWA usando a **logo oficial** com leitura perfeita em qualquer formato de máscara (círculo Android, squircle iOS, quadrado), mantendo a paleta da marca e um acabamento moderno e premium.

## Direção visual

- **Paleta fiel ao app**:
  - Fundo: gradiente diagonal de `#1a1a2e` (azul-noite — `background_color` do manifest) para `#2a1530` (toque ameixa) com vinheta sutil para dar profundidade.
  - Acento: filete dourado fino (`#C9A24C`) na borda interna — alinhado ao "gold accents" da identidade Sephora-like.
  - Toque vermelho da marca (`#E52535`) reservado para um brilho radial discreto atrás da logo, dando vida sem competir com ela.
- **Logo**: `src/assets/bruna-logo.png` centralizada, ocupando ~62% do lado do ícone (área segura), garantindo que sobreviva ao recorte maskable de 80% do Android sem cortar nenhuma letra.
- **Acabamento moderno**:
  - Cantos arredondados (22% do lado) na versão `any` para parecer nativo no iOS.
  - Reflexo de vidro suave no topo (faixa branca a 8% de opacidade) — glassmorphism contido, sem poluir.
  - Sombra interna sutil para dar peso/profundidade.

## Arquivos gerados

| Arquivo | Tamanho | Uso | Purpose |
|---|---|---|---|
| `public/icons/icon-512.png` | 512×512 | Android splash + alta densidade | `any` |
| `public/icons/icon-512-maskable.png` | 512×512 | Android adaptive icon (com safe zone de 80%) | `maskable` |
| `public/icons/icon-192.png` | 192×192 | Android home / atalhos | `any` |
| `public/icons/icon-192-maskable.png` | 192×192 | Android adaptive icon menor | `maskable` |
| `public/icons/apple-touch-icon.png` | 180×180 | iOS "Adicionar à Tela de Início" | (sem máscara, cantos próprios do iOS) |
| `public/icons/favicon-32.png` | 32×32 | Aba do navegador | — |

**Por que separar `any` e `maskable`**: hoje o manifest declara `purpose: "any maskable"` no mesmo arquivo, o que faz o Android cortar 20% do ícone — é por isso que a logo "some" nas bordas. Separar em dois arquivos é a prática recomendada e resolve o problema de responsividade entre dispositivos.

## Mudanças de código

1. **Script de geração** (`/tmp/gen-pwa-icons.mjs`, descartável) — usa `sharp` (já disponível via npx) para:
   - Compor o gradiente de fundo + vinheta + brilho radial vermelho.
   - Sobrepor a logo redimensionada com a área segura correta para cada `purpose`.
   - Aplicar máscara de cantos arredondados na versão `any` e no apple-touch-icon.
   - Exportar PNG otimizado (palette + compressão zlib 9).

2. **`public/manifest.json`** — atualizar a lista `icons` para apontar para os 5 arquivos com `purpose` correto em cada um, adicionar campo `id: "/"` (estabilidade de instalação) e manter `theme_color`/`background_color` da marca.

3. **`index.html`** — adicionar:
   - `<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />`
   - `<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />` (já existe, manter)
   - Manter `theme-color` `#1a1a2e`.

## QA visual obrigatório

Antes de entregar, vou converter os 5 PNGs em previews e inspecionar:
- A logo está totalmente legível dentro do círculo (Android adaptive)?
- O acento dourado e o brilho aparecem sem virar ruído?
- O contraste fundo↔logo está bom no modo claro do iOS e no fundo escuro do Android?
- Não há serrilhado nas bordas arredondadas?

Se qualquer item falhar, ajusto o script e regenero antes de finalizar.

## Resultado esperado

- PWA instalável no iPhone (Safari → Compartilhar → Adicionar à Tela de Início) e no Android (Chrome → Instalar app) com **ícone fiel à marca**, logo nítida em qualquer tamanho e adaptado às máscaras de cada SO.
- Visual coerente com o resto do app: azul-noite + dourado + toque vermelho, acabamento premium, moderno.
