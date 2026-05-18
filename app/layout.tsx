import type { ReactNode } from 'react'

export const metadata = { title: 'MPP Proxy' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
