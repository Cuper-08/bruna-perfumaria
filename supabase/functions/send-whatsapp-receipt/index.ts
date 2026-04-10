import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const record = payload.record // The inserted/updated 'orders' row from the webhook
    
    // Safety check
    if (!record || !record.customer_phone) {
      return new Response(JSON.stringify({ error: 'No phone number or record found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // Environment Variables
    const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || 'https://evo.hsbmarketing.com.br';
    const EVOLUTION_INSTANCE = Deno.env.get('EVOLUTION_INSTANCE') || 'LUNA.AI';
    const EVOLUTION_API_TOKEN = Deno.env.get('EVOLUTION_API_TOKEN') || '3555A856E07A-4666-94D8-A8842D809ECE';

    // Formatar tipo de pagamento para o cliente humano entender
    const paymentLabels: Record<string, string> = {
      pix:              '💠 Pix (Pagamento Online)',
      cartao_online:    '💳 Cartão de Crédito/Débito (Online)',
      dinheiro_entrega: '💵 Dinheiro na Entrega — tenha o troco separado!',
      cartao_entrega:   '💳 Cartão na Entrega — nossa maquininha vai junto!',
    };
    const formattedPayment = paymentLabels[record.payment_method] || record.payment_method || 'Não informado';

    const message = `
*Bruna Perfumaria - Resumo do Pedido #${record.order_number || ''}* 

Olá, ${record.customer_name || 'cliente'}! Seu pedido foi confirmado e recebido com sucesso no nosso sistema. 🎉

*🛒 Resumo do Pedido:*
* Valor Total: R$ ${Number(record.total).toFixed(2).replace('.', ',')}
* Forma de Pagamento: ${formattedPayment}
* Status do Pedido: Aprovado e Preparando ✅

📍 *Aviso Importante:*
Sua entrega já está no radar da loja e será coletada e enviada o mais breve possível.
Pedimos que aguarde a chegada do motoboy no endereço indicado. Em caso de necessidade ou urgência, **por favor não responda esta mensagem**. A *Luna AI* é um assistente reativo de envios automáticos e mensagens enviadas aqui não são vistas por humanos.

📞 Para falar conosco, entre em contato direto pelo WhatsApp de Suporte oficial disponibilizado no botão de contato do nosso Site.

Agradecemos demais a sua preferência! ✨
    `.trim();

    // Evolution API /message/sendText Endpoint
    const endpoint = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;
    
    // Deixar o celular limpo (tirar () - ). A Evolution espera 55XX...
    let cleanPhone = String(record.customer_phone).replace(/\D/g, '');
    
    // Se o cliente não digitou 55 (Brasil) no começo, adicionar.
    if (cleanPhone.length >= 10 && !cleanPhone.startsWith('55')) {
       cleanPhone = '55' + cleanPhone;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_API_TOKEN
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
