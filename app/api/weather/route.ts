import { NextRequest, NextResponse } from "next/server";

// ─── Rate Limiter ─────────────────────────────────────────────────────────────
// In-memory store: cocok untuk deployment single-instance (VPS, Railway, Render).
// Untuk Vercel (serverless/multi-instance), gunakan Redis (Upstash) sebagai gantinya.

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp (ms) saat window direset
}

// Map ini hidup selama server process hidup — reset saat deploy ulang
const rateLimitStore = new Map<string, RateLimitEntry>();

// Konfigurasi batas request
const RATE_LIMIT_MAX = 10;          // maks request per window
const RATE_LIMIT_WINDOW_MS = 60_000; // window 60 detik

function getRateLimitEntry(ip: string): RateLimitEntry {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Jika belum ada atau window sudah habis, buat entry baru
  if (!entry || now >= entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(ip, newEntry);
    return newEntry;
  }

  return entry;
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const entry = getRateLimitEntry(ip);
  entry.count += 1;

  // Bersihkan entry yang sudah expired untuk mencegah memory leak
  // (hanya bersihkan saat ada request masuk, bukan via setInterval)
  if (rateLimitStore.size > 5_000) {
    const now = Date.now();
    for (const [key, val] of rateLimitStore.entries()) {
      if (now >= val.resetAt) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((entry.resetAt - Date.now()) / 1000);
    return { allowed: false, retryAfterSec };
  }

  return { allowed: true, retryAfterSec: 0 };
}

// ─── Input Sanitization ───────────────────────────────────────────────────────

// Regex whitelist: huruf unicode (termasuk aksara non-latin seperti São Paulo, Köln),
// spasi, tanda hubung, titik, dan apostrof — karakter umum dalam nama kota dunia.
// Semua karakter lain (tag HTML, SQL, path traversal, dll.) langsung ditolak.
const CITY_ALLOWED_PATTERN = /^[\p{L}\s\-'.]+$/u;
const CITY_MAX_LENGTH = 100;

function sanitizeCity(raw: string): { valid: boolean; value: string; reason?: string } {
  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return { valid: false, value: "", reason: "Nama kota tidak boleh kosong." };
  }

  if (trimmed.length > CITY_MAX_LENGTH) {
    return {
      valid: false,
      value: "",
      reason: `Nama kota terlalu panjang (maksimal ${CITY_MAX_LENGTH} karakter).`,
    };
  }

  if (!CITY_ALLOWED_PATTERN.test(trimmed)) {
    return {
      valid: false,
      value: "",
      reason: "Nama kota mengandung karakter yang tidak diizinkan.",
    };
  }

  return { valid: true, value: trimmed };
}

// ─── Base URL OWM ─────────────────────────────────────────────────────────────
const OWM_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  // ── 1. Rate Limiting ────────────────────────────────────────────────────
  // Ambil IP dari header yang di-set reverse proxy
  // Fallback ke "unknown" — tetap di-rate-limit agar tidak bisa di-bypass
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  const { allowed, retryAfterSec } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi dalam beberapa saat." },
      {
        status: 429,
        headers: {
          // Beri tahu client kapan bisa coba lagi
          "Retry-After": String(retryAfterSec),
          // Tambahkan header standar rate limit untuk transparansi
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ── 2. Input Sanitization ───────────────────────────────────────────────
  const rawCity = req.nextUrl.searchParams.get("city") ?? "";
  const { valid, value: city, reason } = sanitizeCity(rawCity);

  if (!valid) {
    return NextResponse.json(
      { error: reason ?? "Input tidak valid." },
      { status: 400 }
    );
  }

  // ── 3. API Key Validation ───────────────────────────────────────────────
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    console.error("[weather/route] OPENWEATHERMAP_API_KEY belum diset.");
    return NextResponse.json(
      { error: "Konfigurasi server bermasalah. Hubungi administrator." },
      { status: 500 }
    );
  }

  // ── 4. Fetch ke OpenWeatherMap ──────────────────────────────────────────
  const targetUrl = `${OWM_BASE_URL}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=id`;

  let owmResponse: Response;

  try {
    owmResponse = await fetch(targetUrl, {
      // Cache selama 5 menit supaya tidak spam ke API eksternal
      next: { revalidate: 300 },
    });
  } catch (networkError) {
    console.error("[weather/route] Gagal fetch ke OWM:", networkError);
    return NextResponse.json(
      { error: "Tidak dapat terhubung ke layanan cuaca. Coba lagi nanti." },
      { status: 503 }
    );
  }

  const owmData = await owmResponse.json();

  // ── 5. Error Handling dari OWM ──────────────────────────────────────────
  if (!owmResponse.ok) {
    const owmCode = owmData?.cod;

    if (owmCode === "404") {
      return NextResponse.json(
        { error: `Kota "${city}" tidak ditemukan. Periksa ejaan dan coba lagi.` },
        { status: 404 }
      );
    }

    if (owmCode === 401) {
      console.error("[weather/route] API key tidak valid.");
      return NextResponse.json(
        { error: "API key tidak valid. Hubungi administrator." },
        { status: 401 }
      );
    }

    if (owmCode === 429) {
      console.warn("[weather/route] Rate limit OWM tercapai.");
      return NextResponse.json(
        { error: "Layanan cuaca sedang sibuk. Coba lagi dalam beberapa saat." },
        { status: 429 }
      );
    }

    console.error("[weather/route] Error tidak dikenal dari OWM:", owmData);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data cuaca." },
      { status: owmResponse.status }
    );
  }

  // ── 6. Response — kirim hanya field yang diperlukan ─────────────────────
  return NextResponse.json({
    city: owmData.name,
    country: owmData.sys?.country,
    temperature: owmData.main?.temp,
    feelsLike: owmData.main?.feels_like,
    humidity: owmData.main?.humidity,
    description: owmData.weather?.[0]?.description,
    icon: owmData.weather?.[0]?.icon,
    windSpeed: owmData.wind?.speed,
    timezone: owmData.timezone,
    dt: owmData.dt,
  });
}
