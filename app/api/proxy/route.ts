import { mppx, PRICE, ALLOWED_DOMAINS } from '@/lib/mppx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request): Promise<Response> {
  // 1. Payment middleware FIRST — must return 402 before any validation,
  //    so MPPScan and agents can discover pricing on an empty request.
  const charge = mppx.charge({ amount: PRICE })
  const result = await charge(request)
  if (result.status === 402) return result.challenge

  // 2. Payment confirmed — now validate inputs.
  //    Wrap error responses with result.withReceipt() so the client gets
  //    proof of payment even when the request itself is malformed.
  let body: { url?: string; method?: string; body?: unknown; headers?: Record<string, string> }
  try {
    body = await request.json()
  } catch {
    return result.withReceipt(
      Response.json({ error: 'Invalid JSON body' }, { status: 400 })
    )
  }

  const { url, method = 'GET', body: targetBody, headers: extraHeaders = {} } = body

  if (!url) {
    return result.withReceipt(
      Response.json({ error: 'Missing required field: url' }, { status: 400 })
    )
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return result.withReceipt(
      Response.json({ error: 'Invalid url' }, { status: 400 })
    )
  }

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return result.withReceipt(
      Response.json(
        { error: `Domain not allowed: ${parsedUrl.hostname}`, allowed: ALLOWED_DOMAINS },
        { status: 403 }
      )
    )
  }

  // 3. Proxy the request
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'mpp-proxy/1.0',
      ...extraHeaders,
    },
  }

  if (targetBody && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(targetBody)
  }

  try {
    const upstream = await fetch(url, fetchOptions)
    const data = await upstream.text()
    return result.withReceipt(
      new Response(data, {
        status: upstream.status,
        headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
      })
    )
  } catch (err) {
    return result.withReceipt(
      Response.json({ error: 'Upstream request failed', detail: String(err) }, { status: 502 })
    )
  }
}

export async function GET() {
  return Response.json({
    service: 'mpp-proxy',
    description: 'Paid API proxy — POST with { url, method?, body?, headers? }',
    charge: `${PRICE} USDC.e per request`,
    allowed_domains: ALLOWED_DOMAINS,
  })
}
