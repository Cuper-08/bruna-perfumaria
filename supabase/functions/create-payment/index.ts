import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ASAAS_API_URL = 'https://api.asaas.com/v3'

async function asaasRequest(path: string, method = 'GET', body?: unknown) {
  const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!
  const res = await fetch(`${ASAAS_API_URL}${path}`, {
    method,
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
      'access_token': ASAAS_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json()
}

function cleanCpf(cpf: string) {
  return cpf.replace(/\D/g, '')
}

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, '')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload = await req.json()
    const {
      customer_name,
      customer_phone,
      customer_cpf,
      address,
      items,
      payment_method,
      needs_change,
      change_for,
      notes,
      subtotal,
      delivery_fee,
      total,
    } = payload

    const needsAsaasCharge = payment_method === 'pix' || payment_method === 'cartao_online'

    let asaas_payment_id: string | null = null
    let asaas_customer_id: string | null = null
    let pix_qr_code: string | null = null
    let pix_copy_paste: string | null = null
    let pix_expire_date: string | null = null
    let invoice_url: string | null = null

    if (needsAsaasCharge) {
      if (!customer_cpf || cleanCpf(customer_cpf).length < 11) {
        return new Response(
          JSON.stringify({ error: 'CPF é obrigatório para pagamentos online.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 1. Find or create Asaas customer
      const cpf = cleanCpf(customer_cpf)
      const searchRes = await asaasRequest(`/customers?cpfCnpj=${cpf}`)

      let customerId: string
      if (searchRes.data && searchRes.data.length > 0) {
        customerId = searchRes.data[0].id
      } else {
        const customerRes = await asaasRequest('/customers', 'POST', {
          name: customer_name,
          cpfCnpj: cpf,
          mobilePhone: cleanPhone(customer_phone),
          notificationDisabled: true,
        })
        if (customerRes.errors) {
          throw new Error(customerRes.errors[0]?.description || 'Erro ao criar cliente no Asaas')
        }
        customerId = customerRes.id
      }
      asaas_customer_id = customerId

      // 2. Create charge
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 1)
      const dueDateStr = dueDate.toISOString().split('T')[0]

      const billingType = payment_method === 'pix' ? 'PIX' : 'CREDIT_CARD'

      const chargeRes = await asaasRequest('/payments', 'POST', {
        customer: customerId,
        billingType,
        value: total,
        dueDate: dueDateStr,
        description: 'Pedido - Bruna Perfumaria',
        notificationDisabled: true,
      })

      if (chargeRes.errors) {
        throw new Error(chargeRes.errors[0]?.description || 'Erro ao criar cobrança no Asaas')
      }

      asaas_payment_id = chargeRes.id
      invoice_url = chargeRes.invoiceUrl || null

      // 3. For PIX: fetch QR code
      if (payment_method === 'pix') {
        const pixRes = await asaasRequest(`/payments/${chargeRes.id}/pixQrCode`)
        pix_qr_code = pixRes.encodedImage || null
        pix_copy_paste = pixRes.payload || null
        pix_expire_date = pixRes.expirationDate || null
      }
    }

    // 4. Determine payment_status
    const payment_status = needsAsaasCharge ? 'pending' : 'delivery_payment'

    // 5. Insert order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name,
        customer_phone,
        customer_cpf: customer_cpf || null,
        address,
        items,
        subtotal,
        delivery_fee,
        total,
        payment_method,
        payment_status,
        order_status: 'received',
        needs_change: needs_change ?? false,
        change_for: change_for ?? null,
        notes: notes || null,
        asaas_payment_id,
        asaas_customer_id,
        pix_qr_code,
        pix_copy_paste,
        pix_expire_date,
        invoice_url,
      })
      .select()
      .single()

    if (orderError) throw orderError

    return new Response(
      JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        payment_method,
        pix_qr_code,
        pix_copy_paste,
        pix_expire_date,
        invoice_url,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('create-payment error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Erro interno ao processar pedido.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
