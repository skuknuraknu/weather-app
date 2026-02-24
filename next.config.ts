import type { NextConfig } from "next";

// ─── Content Security Policy ───────────────────────────────────────────────────
// Dibuat per-direktif agar mudah dibaca dan di-maintain
const ContentSecurityPolicy = [
  // Semua resource default hanya boleh dari origin sendiri
  "default-src 'self'",

  // Script: Next.js App Router memerlukan inline script untuk hydration
  "script-src 'self' 'unsafe-inline'",

  // Style: Tailwind CSS menghasilkan style tag inline
  "style-src 'self' 'unsafe-inline'",

  // Gambar: data URI untuk placeholder, openweathermap untuk ikon cuaca (opsional)
  "img-src 'self' data: openweathermap.org",

  // Koneksi API: fetch ke API route internal & OWM (via server, tapi baik untuk ada)
  "connect-src 'self'",

  // Font: hanya dari origin sendiri (tidak pakai Google Fonts)
  "font-src 'self'",

  // Larang object/embed/plugin Flash-era
  "object-src 'none'",

  // Larang form action ke domain lain
  "form-action 'self'",

  // Larang base tag untuk cegah base-URI hijacking
  "base-uri 'self'",

  // Larang halaman ini dimuat dalam iframe di domain manapun (double protection + X-Frame-Options)
  "frame-ancestors 'none'",
]
  .join("; ")
  .trim();

// ─── Security Headers ─────────────────────────────────────────────────────────
const securityHeaders = [
  // CSP: perlindungan utama terhadap XSS dan data injection
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  // HSTS: paksa HTTPS selama 1 tahun, termasuk subdomain; preload untuk browser list
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  // Clickjacking: larang halaman dimuat dalam frame/iframe
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // MIME sniffing: paksa browser hormati Content-Type yang dikirim server
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Referrer: kirim referrer hanya ke origin sama, tidak ke pihak ketiga
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Permissions Policy: nonaktifkan API browser yang tidak digunakan
  // Kurangi attack surface & lindungi privasi user
  {
    key: "Permissions-Policy",
    value: [
      "camera=()",        // tidak butuh kamera
      "microphone=()",    // tidak butuh mikrofon
      "geolocation=()",   // tidak butuh lokasi (pakai nama kota manual)
      "payment=()",       // tidak ada fitur pembayaran
      "usb=()",           // tidak ada akses USB
      "interest-cohort=()", // opt-out dari FLoC/Topics API Google
    ].join(", "),
  },
  // DNS Prefetch: kurangi kebocoran informasi melalui DNS
  {
    key: "X-DNS-Prefetch-Control",
    value: "off",
  },
  // Sembunyikan teknologi server dari header respons
  {
    key: "X-Powered-By",
    value: "none",
  },
];

// ─── Next.js Config ───────────────────────────────────────────────────────────
const nextConfig: NextConfig = {
  // Terapkan security headers ke semua route
  async headers() {
    return [
      {
        // Matcher "/:path*" mencakup semua halaman dan API route
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Sembunyikan header X-Powered-By bawaan Next.js
  poweredByHeader: false,
};

export default nextConfig;
