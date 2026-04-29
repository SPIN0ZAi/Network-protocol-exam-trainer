# Networking Exercise — Next.js + TypeScript (Vercel-ready)

This repository contains a minimal Next.js + TypeScript scaffold that wraps the interactive networking exercise as a static page and exposes simple API routes for modes, scenarios and progress. It's ready to deploy to Vercel.

Quick start locally:

```bash
# install
npm install
# dev server
npm run dev
# open http://localhost:3000
```

Pages:
- `/` — landing
- `/arp`, `/arp-dns`, `/dhcp`, `/full` — redirects to the static exercise with `?mode=` query
- `/networking_exercise.html` — static HTML exported to `/public`

API:
- `GET /api/modes` — returns practice modes
- `GET /api/scenarios` — returns a small scenarios JSON (derived from your examples)
- `GET|POST /api/progress` — simple progress persistence (file-backed locally; serverless environments may not persist writes)

About connection persistence:
You provided notes about HTTP persistent vs non-persistent connections. I updated all example scenarios in `data/scenarios.json` to explicitly set `httpPersistent: false` (non-persistent connections). This means the exercises will simulate non-persistent HTTP (one TCP handshake per request/response), consistent with HTTP/1.0 default behavior.

If you'd prefer some scenarios to simulate persistent HTTP (HTTP/1.1+), I can add `httpPersistent: true` to selected scenarios and adjust the generated packet sequences accordingly (single TCP connection used for multiple requests to the same server).

Next steps I can take if you want:
- Replace `/public/networking_exercise.html` with the full interactive HTML ported into React components.
- Add a `httpPersistent` flag per scenario and update the generated packet sequences to reflect persistent vs non-persistent HTTP.
- Add CI/deploy config for Vercel if needed.

