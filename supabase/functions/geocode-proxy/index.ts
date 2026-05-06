import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LOCATIONIQ_BASE = 'https://us1.locationiq.com/v1/search'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Rate limit: 30 geocode lookups per IP per 5 minutes
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { data: rlOk } = await supabase.rpc('check_rate_limit', {
      p_key: `geocode:${ip}`,
      p_max: 30,
      p_window_seconds: 300,
    })
    if (rlOk === false) {
      return new Response(
        JSON.stringify({ error: 'rate_limited' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const provider = url.searchParams.get('provider') || 'locationiq'
    const q = url.searchParams.get('q') || ''
    const cep = url.searchParams.get('cep') || ''

    if (!q && !cep) {
      return new Response(
        JSON.stringify({ error: 'missing_query' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let endpoint: string
    let headers: Record<string, string> = { 'accept': 'application/json' }

    if (provider === 'nominatim') {
      const params = new URLSearchParams({
        q: q || cep,
        format: 'json',
        countrycodes: 'br',
        limit: '1',
        addressdetails: '1',
      })
      endpoint = `${NOMINATIM_BASE}?${params}`
      headers['User-Agent'] = 'BrunaPerfumaria/1.0'
    } else {
      const KEY = Deno.env.get('LOCATIONIQ_KEY')
      if (!KEY) {
        return new Response(
          JSON.stringify({ error: 'provider_not_configured' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      const params = new URLSearchParams({
        key: KEY,
        q: q || cep,
        format: 'json',
        countrycodes: 'br',
        limit: '1',
        addressdetails: '1',
      })
      endpoint = `${LOCATIONIQ_BASE}?${params}`
    }

    const res = await fetch(endpoint, { headers })
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: `provider_error:${res.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await res.json()
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('geocode-proxy error:', err)
    return new Response(
      JSON.stringify({ error: 'internal_error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
