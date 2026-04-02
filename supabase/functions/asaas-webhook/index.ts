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
  // Asaas sends POST with JSON body
  if (req.method !== 'POST') {
    return new Response('ok', { status: 200 })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const payload = await req.json()
    const { event, payment } = payload

    if (!payment?.id || !event) {
      return new Response('ok', { status: 200 })
    }

    const new_payment_status = PAYMENT_STATUS_MAP[event]
    if (!new_payment_status) {
      // Ignored event
      return new Response('ok', { status: 200 })
    }

    // Verify payment with Asaas before trusting the webhook
    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY')!
    const verifyRes = await fetch(`${ASAAS_API_URL}/payments/${payment.id}`, {
      headers: { 'access_token': ASAAS_API_KEY, 'accept': 'application/json' },
    })
    const verifiedPayment = await verifyRes.json()

    if (!verifiedPayment?.id) {
      console.error('Could not verify payment with Asaas:', payment.id)
      return new Response('ok', { status: 200 })
    }

    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: new_payment_status,
        updated_at: new Date().toISOString(),
      })
      .eq('asaas_payment_id', payment.id)

    if (error) console.error('Webhook DB update error:', error)

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('asaas-webhook error:', err)
    // Always return 200 so Asaas does not keep retrying
    return new Response('ok', { status: 200 })
  }
})
