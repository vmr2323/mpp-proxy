import { Mppx, tempo } from 'mppx/nextjs'

if (!process.env.RECIPIENT_ADDRESS) {
  throw new Error('RECIPIENT_ADDRESS env var is required')
}

export const mppx = Mppx.create({
  methods: [
    tempo({
      currency: '0x20c0000000000000000000000000000000000000', // pathUSD on Tempo
      recipient: process.env.RECIPIENT_ADDRESS,
    }),
  ],
})

export const CHARGE_AMOUNT = process.env.CHARGE_AMOUNT ?? '0.01'

const defaultAllowed = [
  'api.coingecko.com',
  'pro-api.coingecko.com',
  'api.coinmarketcap.com',
  'api.binance.com',
  'api.kraken.com',
  'api.coinpaprika.com',
]

export const ALLOWED_DOMAINS: string[] = process.env.ALLOWED_DOMAINS
  ? process.env.ALLOWED_DOMAINS.split(',').map((d) => d.trim())
  : defaultAllowed
