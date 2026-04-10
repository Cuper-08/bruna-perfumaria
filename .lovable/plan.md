

# Assinatura HSB Marketing no Footer + PWA para Instalacao

## 1. Assinatura HSB Marketing no Footer

Adicionar no `src/components/layout/Footer.tsx`, logo abaixo do copyright existente, o bloco de assinatura identico ao do projeto Bras Conceito:
- Link para `https://www.hsbmarketing.com.br/`
- Logo SVG inline do HSB (circulo azul com letras H, S, B)
- Texto "Desenvolvido por" + "HSB Marketing"
- Hover com glow azul e transicao de opacidade

O bloco sera inserido transformando o `<p>` de copyright em um `<div>` flex-col com o copyright + o link da HSB abaixo.

## 2. PWA - App Instalavel (sem service worker)

Como o usuario quer apenas instalacao em iOS e Android (sem necessidade de offline), usaremos a abordagem simples: **manifest.json + meta tags** — sem `vite-plugin-pwa` nem service workers (evita problemas no preview do Lovable).

### Arquivos

| Arquivo | Acao |
|---------|------|
| `src/components/layout/Footer.tsx` | Adicionar assinatura HSB Marketing |
| `public/manifest.json` | Criar manifest para PWA (name, icons, display: standalone, theme_color) |
| `index.html` | Adicionar `<link rel="manifest">` + meta tags Apple (apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, apple-touch-icon) |

### Detalhes do manifest.json
- `name`: "Bruna Perfumaria"
- `short_name`: "Bruna"
- `start_url`: "/"
- `display`: "standalone"
- `background_color`: "#1a1a2e" (bruna-dark)
- `theme_color`: "#1a1a2e"
- `icons`: Usaremos o logo existente ou criaremos icones placeholder em 192x192 e 512x512

### Meta tags no index.html
```html
<link rel="manifest" href="/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#1a1a2e" />
```

## Resultado
- Footer com assinatura profissional HSB Marketing identica ao Bras Conceito
- App instalavel no celular via "Adicionar a Tela Inicio" (iOS Safari / Android Chrome)

