import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const record = payload.record

    if (!record || !record.customer_phone) {
      return new Response(JSON.stringify({ error: 'No phone number or record found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || 'https://evo.hsbmarketing.com.br';
    const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE') || 'LUNA.AI';
    const EVOLUTION_API_TOKEN = Deno.env.get('EVOLUTION_API_TOKEN') || '3555A856E07A-4666-94D8-A8842D809ECE';

    // Mapeamento completo dos métodos de pagamento (enums do banco)
    const paymentLabels: Record<string, string> = {
      pix:              '💠 Pix (Pagamento Online)',
      cartao_online:    '💳 Cartão de Crédito/Débito (Online)',
      dinheiro_entrega: '💵 Dinheiro na Entrega — tenha o troco separado!',
      cartao_entrega:   '💳 Cartão na Entrega — nossa maquininha vai junto!',
    };
    const formattedPayment = paymentLabels[record.payment_method] || record.payment_method || 'Não informado';

    // Formatar lista de produtos do pedido
    let itemsList = '';
    try {
      const items = Array.isArray(record.items) ? record.items : JSON.parse(record.items || '[]');
      if (items.length > 0) {
        itemsList = items.map((item: { name?: string; product_name?: string; quantity?: number; price?: number; unit_price?: number }) => {
          const name = item.name || item.product_name || 'Produto';
          const qty = item.quantity || 1;
          const price = Number(item.price || item.unit_price || 0);
          return `  • ${qty}x ${name} — R$ ${price.toFixed(2).replace('.', ',')}`;
        }).join('\n');
      } else {
        itemsList = '  • Detalhes dos produtos não disponíveis';
      }
    } catch {
      itemsList = '  • Detalhes dos produtos não disponíveis';
    }

    // Composição do valor
    const subtotal = Number(record.subtotal || 0).toFixed(2).replace('.', ',');
    const deliveryFee = Number(record.delivery_fee || 0).toFixed(2).replace('.', ',');
    const total = Number(record.total || 0).toFixed(2).replace('.', ',');

    const message = `
*Bruna Perfumaria — Confirmação do Pedido #${record.order_number || ''}* 🧾

Olá, ${record.customer_name || 'cliente'}! Seu pedido foi confirmado e já está sendo preparado com todo o carinho. 🎉

*🛍️ Produtos escolhidos:*
${itemsList}

*💰 Composição do valor:*
  • Subtotal dos produtos: R$ ${subtotal}
  • Taxa de entrega: R$ ${deliveryFee}
  • *Total a pagar: R$ ${total}*

*Forma de Pagamento:* ${formattedPayment}

────────────────────────
📍 *Aviso Importante*
Sua entrega já está no radar da loja e será enviada o mais breve possível via motoboy. Aguarde no endereço informado.

*Por favor, não responda esta mensagem.* A *Luna AI* é um assistente automático de notificações — respostas enviadas aqui não são lidas por humanos.

📞 Em caso de necessidade, utilize o botão de contato via WhatsApp disponível no nosso App para falar diretamente com a equipe.

Agradecemos demais pela sua preferência! ✨
    `.trim();

    // Limpar número e garantir formato 55XX para a Evolution API
    let cleanPhone = String(record.customer_phone).replace(/\D/g, '');
    if (cleanPhone.length >= 10 && !cleanPhone.startsWith('55')) {
      cleanPhone = '55' + cleanPhone;
    }

    const endpoint = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_TOKEN
      },
      body: JSON.stringify({
        number: cleanPhone,
        text: message
      })
    });

    const responseData = await response.json();

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
