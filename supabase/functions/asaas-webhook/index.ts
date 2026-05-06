import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ASAAS_API_URL = 'https://api.asaas.com/v3'

const PAYMENT_STATUS_MAP: Record<string, string> = {
  PAYMENT_RECEIVED: 'paid',
  PAYMENT_CONFIRMED: 'paid',
  PAYMENT_OVERDUE: 'failed',
  PAYMENT_DELETED: 'failed',
  PAYMENT_REFUNDED: 'refunded',
  PAYMENT_CHARGEBACK_REQUESTED: 'failed',
  PAYMENT_CHARGEBACK_DISPUTE: 'failed',
  PAYMENT_AWAITING_CHARGEBACK_REVERSAL: 'failed',
  PAYMENT_DUNNING_RECEIVED: 'paid',
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('ok', { status: 200 })
  }

  // Optional signature verification — set ASAAS_WEBHOOK_TOKEN secret + same value in Asaas webhook config
  const expectedToken = Deno.env.get('ASAAS_WEBHOOK_TOKEN')
  if (expectedToken) {
    const receivedToken = req.headers.get('asaas-access-token')
    if (receivedToken !== expectedToken) {
      console.warn('[webhook] invalid signature — rejecting')
      return new Response('unauthorized', { status: 401 })
    }
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload = await req.json()
    const { event, payment } = payload

    console.log(`[webhook] event=${event} payment_id=${payment?.id}`)

    if (!payment?.id || !event) {
      console.log('[webhook] missing event or payment.id — ignoring')
      return new Response('ok', { status: 200 })
    }

    const new_payment_status = PAYMENT_STATUS_MAP[event]
    if (!new_payment_status) {
      console.log(`[webhook] unhandled event=${event} — ignoring`)
      return new Response('ok', { status: 200 })
    }

    // Update DB directly based on event (trusted from Asaas)
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: new_payment_status,
        updated_at: new Date().toISOString(),
      })
      .eq('asaas_payment_id', payment.id)
      .select('id, order_number')

    if (error) {
      console.error('[webhook] DB update error:', JSON.stringify(error))
    } else {
      console.log(`[webhook] updated order: ${JSON.stringify(data)} → ${new_payment_status}`)
    }

    // Optional: background verify with Asaas (non-blocking — just for logging)
    try {
      const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')
      if (ASAAS_API_KEY) {
        const verifyRes = await fetch(`${ASAAS_API_URL}/payments/${payment.id}`, {
          headers: { 'access_token': ASAAS_API_KEY, 'accept': 'application/json' },
        })
        const verified = await verifyRes.json()
        console.log(`[webhook] asaas verify status=${verified?.status} billing=${verified?.billingType}`)
      }
    } catch (verifyErr) {
      console.warn('[webhook] asaas verify failed (non-blocking):', verifyErr)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('[webhook] unhandled error:', err)
    return new Response('ok', { status: 200 })
  }
})
