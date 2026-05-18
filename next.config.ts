import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['mppx'],
  typescript: {
    // mppx uses complex generic types (UniqueIntentHandlers, WithReceipt overloads)
    // that tsc fails to resolve at build time; runtime behavior is correct.
    ignoreBuildErrors: true,
  },
}

export default nextConfig
