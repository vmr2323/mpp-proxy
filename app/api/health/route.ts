import { ALLOWED_DOMAINS, PRICE } from '@/lib/mppx'

export async function GET() {
  return Response.json({
    status: 'ok',
    recipient: process.env.MPP_RECIPIENT,
    charge: `${PRICE} USDC.e`,
    allowed_domains: ALLOWED_DOMAINS,
  })
}
