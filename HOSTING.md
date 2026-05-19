# Hosting Piped

Three ways to run your own instance:

1. [Docker Compose (recommended)](#docker-compose)
2. [GitHub Codespaces](#github-codespaces)
3. [Local npm/pnpm dev](#local-dev)

---

## Docker Compose

Everything runs behind a single nginx port. You point your own reverse proxy at that port —
no extra TLS config needed inside this stack.

**Example Caddy config** (in your existing Caddyfile):
```
piped.yourdomain.com {
    reverse_proxy localhost:8091
}
```

### Steps

**1. Clone**
```bash
git clone https://github.com/YOUR_FORK/Piped.git && cd Piped
```

**2. Create your backend config**
```bash
cp config/piped.properties.example config/piped.properties
# Edit the three URL lines if you want video streams to work (see below)
```

**3. Create `.env`**
```bash
cp .env.example .env
# Edit PORT and POSTGRES_PASSWORD
```

**4. Start**
```bash
docker compose up -d
docker compose logs -f   # watch startup
```

That's it. `reverse_proxy localhost:8091` in your proxy and you're done.

### About `PIPED_EXTERNAL_URL`

The Piped backend generates absolute URLs for video streams using `PROXY_PART` in
`config/piped.properties`. If left empty, streams may not load. Set it to your public URL:

```bash
# .env
PIPED_EXTERNAL_URL=https://piped.yourdomain.com
```

And update `config/piped.properties`:
```
PROXY_PART=https://piped.yourdomain.com
API_URL=https://piped.yourdomain.com/api
FRONTEND_URL=https://piped.yourdomain.com
```

### Updating
```bash
docker compose pull
docker compose up -d --build
```

---

## GitHub Codespaces

**1.** Open the repo → **Code → Codespaces → Create codespace**

**2.** In the terminal:
```bash
pnpm install
pnpm dev
```

Open the forwarded port (Codespaces auto-exposes it).

**3.** For TikTok content, open a second terminal:
```bash
pip install yt-dlp   # if not already installed
cd server && npm install && npm start
```

Vite automatically forwards `/math/*` to `localhost:3000`.

---

## Local dev

```bash
# Install deps
pnpm install

# Optional: point at a Piped API (defaults to /api on same origin)
echo "VITE_PIPED_API=https://pipedapi.kavin.rocks" > .env

# Start frontend
pnpm dev

# Start content relay (separate terminal, needs yt-dlp installed)
cd server && npm install && npm start
```

### Production build
```bash
pnpm build
# Serve dist/ with any static file host
```

---

## Service overview

| Service | Port | What it does |
|---|---|---|
| `frontend` (nginx) | **8091** (public) | Serves static files; routes `/api/*` and `/math/*` internally |
| `pipedapi` | 8080 (internal) | Piped Backend — YouTube data via NewPipe Extractor |
| `postgres` | 5432 (internal) | Database for Piped Backend |
| `edu-relay` | 3000 (internal) | Content relay (yt-dlp based) for short-form video |

---

## Troubleshooting

**Content relay returns no results**
yt-dlp needs to be current. Update inside the container:
```bash
docker compose exec edu-relay pip install -U yt-dlp
```

**Videos don't load / stream errors**
Set `PIPED_EXTERNAL_URL` in `.env` and update `config/piped.properties` (see above).

**Backend won't connect to postgres**
Check that `POSTGRES_PASSWORD` in `.env` matches `hibernate.connection.password` in
`config/piped.properties`.
