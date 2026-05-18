import { Mppx, tempo } from 'mppx/server'
import { USDC_E_ADDRESS } from './chain'

const RECIPIENT = process.env.MPP_RECIPIENT
if (!RECIPIENT || !/^0x[a-fA-F0-9]{40}$/.test(RECIPIENT)) {
  throw new Error('MPP_RECIPIENT env var is required and must be a 0x address')
}

export const mppx = Mppx.create({
  methods: [
    tempo.charge({
      currency: USDC_E_ADDRESS,
      recipient: RECIPIENT as `0x${string}`,
    }),
  ],
})

// PRICE is a decimal string in USDC.e tokens, NOT base units.
// '0.01' = one cent. mppx handles the 6-decimal conversion internally.
export const PRICE = process.env.PRICE || '0.01'

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
