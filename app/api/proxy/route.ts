import { mppx, CHARGE_AMOUNT, ALLOWED_DOMAINS } from '@/lib/mppx'

async function proxyHandler(request: Request): Promise<Response> {
  let body: { url?: string; method?: string; body?: unknown; headers?: Record<string, string> }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { url, method = 'GET', body: targetBody, headers: extraHeaders = {} } = body

  if (!url) {
    return Response.json({ error: 'Missing required field: url' }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return Response.json({ error: 'Invalid url' }, { status: 400 })
  }

  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    return Response.json(
      { error: `Domain not allowed: ${parsedUrl.hostname}`, allowed: ALLOWED_DOMAINS },
      { status: 403 }
    )
  }

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
    return new Response(data, {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
    })
  } catch (err) {
    return Response.json({ error: 'Upstream request failed', detail: String(err) }, { status: 502 })
  }
}

export const POST = mppx.charge({ amount: CHARGE_AMOUNT })(proxyHandler)

export async function GET() {
  return Response.json({
    service: 'mpp-proxy',
    description: 'Paid API proxy — POST with { url, method?, body?, headers? }',
    charge: `${CHARGE_AMOUNT} USDC.e per request`,
    allowed_domains: ALLOWED_DOMAINS,
  })
}
