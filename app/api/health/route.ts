import { ALLOWED_DOMAINS, CHARGE_AMOUNT } from '@/lib/mppx'

export async function GET() {
  return Response.json({
    status: 'ok',
    recipient: process.env.RECIPIENT_ADDRESS,
    charge: `${CHARGE_AMOUNT} USDC.e`,
    allowed_domains: ALLOWED_DOMAINS,
  })
}
