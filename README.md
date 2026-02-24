# Weather Now

A weather app that tells you what's happening outside — and actually looks good doing it.

Built with Next.js, pulls data from OpenWeatherMap, and uses GSAP to animate the background based on current conditions. Rain looks like rain. Clear nights show stars. The theme shifts between day and night based on the *local time at the searched city*, not your device clock — so searching for New York at 8am WIB will show a night sky, because it's 9pm there.

---

## Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **GSAP** — background animations
- **TanStack Query** — data fetching + caching
- **OpenWeatherMap API** — weather data

---

## Features

- Search any city by name
- Animated backgrounds: rain, cloudy, sunny (with spinning sun), night (with twinkling stars and crescent moon)
- Debounced search — no API spam on every keystroke
- Weather advice card (clothing, activity, warnings) that adapts to conditions
- 500ms debounce, 5-minute client-side cache via TanStack Query
- Dark/light theme based on the destination city's local time using OWM's `dt` + `timezone` fields

---

## Getting Started

Clone the repo, install dependencies, and drop your API key in `.env.local`:

```bash
npm install
```

```env
# .env.local
OPENWEATHERMAP_API_KEY=your_key_here
```

Get a free key at [openweathermap.org/api](https://openweathermap.org/api) — the free tier is more than enough.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Screenshots
<img width="1919" height="900" alt="image" src="https://github.com/user-attachments/assets/9fc8aa14-900d-4a97-b67c-ab82b7341acd" />
<img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/d2370493-0024-4d2c-889b-95a6740f1740" />
<img width="1919" height="909" alt="image" src="https://github.com/user-attachments/assets/fa662fce-5f65-4970-89fb-e7e4832f37a8" />

---

## Security

A few things worth noting before deploying:

- `OPENWEATHERMAP_API_KEY` is server-only — never exposed to the browser (no `NEXT_PUBLIC_` prefix)
- Security headers are set in `next.config.ts`: CSP, HSTS, `X-Frame-Options`, `Permissions-Policy`, etc.
- The `/api/weather` route has a basic rate limiter — 10 requests per IP per minute, in-memory. Good enough for personal projects; swap it for Redis (Upstash) if you're going multi-instance
- City input is validated with a unicode-aware regex before it ever touches the OWM URL

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENWEATHERMAP_API_KEY` | Yes | Your OWM API key |

---

## Notes

- The language is set to Indonesian (`lang=id`) in OWM requests. The background and theme detection logic handles both Indonesian and English weather descriptions.
- The rate limiter lives in memory — it resets on server restart and won't work across multiple instances.
- Day/night threshold is 06:00–17:59 local city time.

---

## Deploy

**Vercel (easiest)**

Push to GitHub, import on Vercel, add `OPENWEATHERMAP_API_KEY` under Project → Settings → Environment Variables. Done.

One caveat: Vercel runs serverless functions, meaning each invocation can spin up in a fresh container. The in-memory rate limiter won't persist across them. For a personal project with low traffic it's probably fine. If you actually need rate limiting to hold up, wire in [Upstash Redis](https://upstash.com) and replace the `rateLimitStore` Map with a Redis client.

**Self-hosted (Railway, Render, VPS)**

```bash
npm run build
npm start
```

Set `OPENWEATHERMAP_API_KEY` as an environment variable on your platform. On a single-instance deployment the in-memory rate limiter works as expected.

