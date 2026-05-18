export const runtime = 'nodejs'

export async function GET(): Promise<Response> {
  const baseUrl =
    (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    'http://localhost:3000'

  // PRICE is decimal string (used by mppx.charge), but openapi requires base units.
  // USDC.e has 6 decimals, so PRICE='0.01' → priceBaseUnits='10000'.
  const PRICE = process.env.PRICE || '0.01'
  const priceBaseUnits = Math.round(Number(PRICE) * 1_000_000).toString()
  const priceDisplay = Number(PRICE).toFixed(2)

  const ALLOWED_DOMAINS = process.env.ALLOWED_DOMAINS
    ? process.env.ALLOWED_DOMAINS.split(',').map((d) => d.trim())
    : ['api.coingecko.com', 'api.binance.com', 'api.kraken.com']

  const doc = {
    openapi: '3.1.0',
    info: {
      title: 'MPP API Proxy',
      version: '1.0.0',
      description: `Paid HTTP proxy to public APIs (${ALLOWED_DOMAINS.join(', ')}). POST with { url, method?, body?, headers? }.`,
      'x-guidance': 'Paid endpoints require MPP payment. Use npx mppx <url> or any MPP-compatible client.',
    },
    servers: [{ url: baseUrl }],
    'x-service-info': {
      categories: ['data', 'proxy'],
      docs: { homepage: baseUrl, apiReference: `${baseUrl}/openapi.json` },
    },
    paths: {
      '/api/proxy': {
        post: {
          summary: 'Proxy a request to a public API',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['url'],
                  properties: {
                    url: { type: 'string', example: 'https://api.coingecko.com/api/v3/ping' },
                    method: { type: 'string', default: 'GET' },
                    body: { type: 'object' },
                    headers: { type: 'object' },
                  },
                },
              },
            },
          },
          'x-payment-info': {
            intent: 'charge',
            method: 'tempo',
            amount: priceBaseUnits,
            currency: '0x20c000000000000000000000b9537d11c60e8b50',
            description: `$${priceDisplay} USDC.e per proxied request`,
          },
          responses: {
            '200': { description: 'Proxied API response' },
            '400': { description: 'Invalid input' },
            '402': { description: 'Payment Required' },
            '403': { description: 'Domain not in allowlist' },
            '502': { description: 'Upstream error' },
          },
        },
      },
    },
  }

  return Response.json(doc, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
