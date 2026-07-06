import { readFileSync, writeFileSync } from 'node:fs'

const firebasePath = process.argv[2] ?? 'saegim-card/firebase.json'

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data:",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const cacheHeaders = [
  { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
  ...securityHeaders,
]

const indexHeaders = [
  { key: 'Cache-Control', value: 'no-store' },
  ...securityHeaders,
]

const firebase = JSON.parse(readFileSync(firebasePath, 'utf8').replace(/^\uFEFF/, ''))
firebase.hosting ??= {}
firebase.hosting.headers = [
  ...(firebase.hosting.headers ?? []).filter(
    (entry) => !['/saju/**', '/saju/assets/**', '/saju/index.html'].includes(entry.source),
  ),
  { source: '/saju/assets/**', headers: cacheHeaders },
  { source: '/saju/index.html', headers: indexHeaders },
  { source: '/saju/**', headers: securityHeaders },
]

writeFileSync(firebasePath, `${JSON.stringify(firebase, null, 2)}\n`)
