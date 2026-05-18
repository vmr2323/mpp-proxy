import { Mppx, tempo } from 'mppx/server'
import { USDC_E_ADDRESS } from './chain'

export const PRICE = process.env.PRICE || '0.01'

export const ALLOWED_DOMAINS: string[] = process.env.ALLOWED_DOMAINS
  ? process.env.ALLOWED_DOMAINS.split(',').map((d) => d.trim())
  : [
      'api.coingecko.com',
      'pro-api.coingecko.com',
      'api.coinmarketcap.com',
      'api.binance.com',
      'api.kraken.com',
      'api.coinpaprika.com',
    ]

// Lazy singleton — ініціалізується при першому запиті, а не під час збірки.
// Це запобігає помилкам build-time коли Next.js аналізує route exports:
// Mppx.create() кидає якщо MPP_SECRET_KEY не встановлений.
let _mppx: ReturnType<typeof Mppx.create> | null = null

export function getMppx() {
  if (_mppx) return _mppx

  const RECIPIENT = process.env.MPP_RECIPIENT
  if (!RECIPIENT || !/^0x[a-fA-F0-9]{40}$/.test(RECIPIENT)) {
    throw new Error('MPP_RECIPIENT env var is required and must be a valid 0x address')
  }

  // MPP_SECRET_KEY обов'язковий для Mppx.create(); якщо не встановлений —
  // генеруємо детермінований ключ з адреси отримувача як fallback.
  const secretKey = process.env.MPP_SECRET_KEY || `mpp-${RECIPIENT}`

  _mppx = Mppx.create({
    methods: [
      tempo.charge({
        currency: USDC_E_ADDRESS,
        recipient: RECIPIENT as `0x${string}`,
      }),
    ],
    secretKey,
  })

  return _mppx
}
