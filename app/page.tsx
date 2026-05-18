export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: '600px' }}>
      <h1>MPP API Proxy</h1>
      <p>Paid proxy to public APIs via <a href="https://tempo.xyz">Tempo MPP</a>.</p>
      <h2>Usage</h2>
      <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px' }}>{`POST /api/proxy
Content-Type: application/json
Authorization: Payment <proof>

{
  "url": "https://api.coingecko.com/api/v3/ping",
  "method": "GET"
}`}</pre>
      <p>Returns <code>402 Payment Required</code> without valid MPP payment.</p>
      <p>Check <a href="/api/health">/api/health</a> for service info.</p>
    </main>
  )
}
