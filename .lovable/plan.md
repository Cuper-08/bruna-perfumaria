

# PWA Icon com Logo Oficial + Glassmorphism Premium

## Contexto
Os icones PWA atuais (`public/icons/icon-192.png` e `icon-512.png`) sao placeholders genericos. O logo real da Bruna Perfumaria esta em `src/assets/bruna-logo.png`. Preciso gerar icones PWA de alta qualidade usando o logo real, com efeito glassmorphism premium.

## Plano

### 1. Gerar icones PWA com logo + glassmorphism
Usar um script Python (Pillow) para:
- Carregar `src/assets/bruna-logo.png` como base
- Criar canvas 512x512 e 192x192 com fundo gradiente premium (tons da paleta: vermelho #E52535 → dark #1a1a2e)
- Adicionar efeito glassmorphism: camada semi-transparente com blur, borda sutil luminosa, reflexo de luz
- Centralizar o logo com padding adequado
- Adicionar cantos arredondados (rounded square, padrao de icones modernos)
- Salvar em `public/icons/icon-512.png` e `public/icons/icon-192.png`
- Gerar tambem `public/icons/apple-touch-icon.png` (180x180) para iOS

### 2. Atualizar manifest.json
- Adicionar entrada para `apple-touch-icon` (180x180)
- Adicionar `purpose: "any maskable"` nos icones existentes

### 3. Atualizar index.html
- Adicionar `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">`

## Arquivos

| Arquivo | Acao |
|---------|------|
| `public/icons/icon-512.png` | Regenerar com logo real + glassmorphism |
| `public/icons/icon-192.png` | Regenerar com logo real + glassmorphism |
| `public/icons/apple-touch-icon.png` | Criar (180x180) |
| `public/manifest.json` | Atualizar com apple-touch-icon + maskable |
| `index.html` | Adicionar apple-touch-icon link |

## Resultado
Icones PWA premium com o logo oficial da Bruna Perfumaria, efeito glassmorphism (gradiente, blur, reflexo), paleta de cores fiel, e suporte completo iOS + Android.

