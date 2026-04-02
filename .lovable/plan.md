

# Checkout Inteligente e Moderno — Bruna Perfumaria

## Resumo
Criar uma pagina de checkout multi-step com visual premium, preparada para integracao com ASAAS (que sera feita via Claude Code). O checkout coleta dados do cliente, endereco, metodo de pagamento e cria o pedido no Supabase. Nao implementa gateway — apenas salva o pedido com o metodo escolhido.

## Fluxo do Checkout (3 steps)

```text
[1. Dados Pessoais] → [2. Endereco] → [3. Pagamento + Resumo]
```

## Alteracoes

### 1. Novo: `src/pages/CheckoutPage.tsx`
Pagina principal com stepper visual (3 etapas com indicador de progresso animado).

**Step 1 — Dados Pessoais:**
- Nome completo (obrigatorio)
- Telefone com mascara (obrigatorio)
- CPF com mascara (opcional, necessario para PIX)
- Observacoes do pedido (textarea opcional)

**Step 2 — Endereco de Entrega:**
- CEP (com auto-preenchimento via API ViaCEP)
- Rua, Numero, Complemento, Bairro, Cidade
- Taxa de entrega carregada do `admin_settings`

**Step 3 — Pagamento + Resumo:**
- Selecao do metodo: PIX, Cartao Online, Dinheiro na Entrega, Cartao na Entrega
- Se "Dinheiro na Entrega": campo "Troco para quanto?"
- Resumo visual: lista de itens, subtotal, taxa entrega, total
- Botao "Confirmar Pedido"

**Ao confirmar:**
- Insere na tabela `orders` com todos os campos
- Para PIX/Cartao Online: `payment_status = 'pending'` (ASAAS processa depois)
- Para pagamento na entrega: `payment_status = 'delivery_payment'`
- Limpa o carrinho
- Redireciona para pagina de confirmacao

### 2. Novo: `src/pages/OrderConfirmationPage.tsx`
- Exibe numero do pedido, status, resumo
- Se PIX: area reservada para QR Code (preenchida pelo ASAAS depois)
- Botao "Acompanhar Pedido" e "Voltar a Loja"

### 3. Novo: `src/hooks/useViaCep.ts`
- Hook que recebe CEP, faz fetch em `viacep.com.br/ws/{cep}/json`
- Retorna rua, bairro, cidade, estado
- Debounce de 500ms, ativa quando CEP tem 8 digitos

### 4. `src/App.tsx`
- Adicionar rotas `/checkout` e `/pedido/:id`

### 5. Visual Premium
- Stepper com circulos numerados conectados por linha, step ativo em vermelho com glow
- Cards com `bg-card border border-border rounded-2xl shadow-sm`
- Inputs com `rounded-xl` e labels elegantes
- Animacoes framer-motion: fade entre steps, slide-in nos campos
- Botoes "Proximo" e "Voltar" com transicoes suaves
- Resumo lateral sticky no desktop, colapsavel no mobile

## Arquivos

| Arquivo | Acao |
|---------|------|
| `src/pages/CheckoutPage.tsx` | Novo — checkout multi-step |
| `src/pages/OrderConfirmationPage.tsx` | Novo — confirmacao do pedido |
| `src/hooks/useViaCep.ts` | Novo — auto-preenchimento de endereco |
| `src/App.tsx` | Adicionar rotas /checkout e /pedido/:id |

## Nota sobre ASAAS
O checkout salva o pedido com `payment_method` e `payment_status` corretos. A integracao com ASAAS (gerar PIX, cobrar cartao, webhooks) sera feita separadamente via Claude Code. O checkout ja deixa os campos `asaas_payment_id`, `pix_qr_code`, `pix_copy_paste` prontos para serem preenchidos pela edge function do ASAAS.

