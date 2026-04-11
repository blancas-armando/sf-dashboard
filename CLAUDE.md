# SF Dashboard

Live city dashboard for San Francisco — web app + TRMNL e-ink display.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind v4
- Deployed on Vercel

## Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```

## Data Sources

- **MUNI N-Judah**: 511.org StopMonitoring SIRI API (key required)
- **Weather**: OpenWeatherMap Current Weather API (key required)
- **Game Day**: ESPN public API (no key needed)
- **311 Reports**: SF Open Data Socrata API (no key needed)

## Env Vars

See `.env.example`. Keys go in `.env.local` (gitignored).

## Architecture

- `src/lib/` — data fetchers with `unstable_cache` TTLs
- `src/components/` — dashboard panels (client-side polling)
- `src/app/api/dashboard/` — JSON endpoint for client polling
- `src/app/api/trmnl/` — TRMNL e-ink plugin endpoints
- `src/app/preview/` — browser preview of TRMNL e-ink output
