# Hosting Piped

Three deployment options:

1. [Docker Compose (recommended)](#docker-compose)
2. [GitHub Codespaces](#github-codespaces)
3. [Local npm/pnpm dev](#local-dev)

---

## How BYOD works

Unlike the original Piped, **no domain configuration is required**.

nginx uses `sub_filter` to rewrite the Piped Backend's placeholder URLs
(`http://placeholder.invalid/...`) with the actual domain from each incoming request's
`Host` + `X-Forwarded-Proto` headers — the same approach Invidious uses.

You can put this behind any domain, change domains later, or run it locally:
everything auto-detects at request time.

---

## Docker Compose

**Requirements:** Docker Engine 24+ and Docker Compose v2.

```bash
git clone https://github.com/YOUR_FORK/Piped.git
cd Piped

# 1. Create backend config (only the DB password needs changing)
cp config/piped.properties.example config/piped.properties
# Edit: change hibernate.connection.password=changeme to something strong

# 2. Create .env
cp .env.example .env
# Edit: set POSTGRES_PASSWORD to match the password above

# 3. Start
docker compose up -d
```

**Caddy config** (in your existing Caddyfile — nothing else needed):
```
piped.example.com {
    reverse_proxy localhost:8091
}
```

That's it. Works on any domain with no further config.

### Updating
```bash
docker compose pull
docker compose up -d --build
```

---

## GitHub Codespaces

1. Open repo → **Code → Codespaces → Create codespace**
2. In the terminal:
   ```bash
   pnpm install && pnpm dev
   ```
3. Codespaces auto-forwards the port — open the forwarded URL.

**For the content relay** (second terminal):
```bash
pip install yt-dlp
cd server && npm install && npm start
```

Vite automatically forwards `/math/*` → `localhost:3000`.

---

## Local dev

```bash
pnpm install

# Optional: use a public Piped API instead of running the backend locally
echo "VITE_PIPED_API=https://pipedapi.kavin.rocks" > .env

pnpm dev
```

**Content relay** (separate terminal, needs yt-dlp):
```bash
cd server && npm install && npm start
```

### Production build
```bash
pnpm build   # output in dist/
```

Serve `dist/` with any static file host. For the full stack locally, use Docker Compose.

---

## Service overview

| Service | Port | Role |
|---|---|---|
| `frontend` (nginx) | **8091** ← only public port | Static files + internal routing |
| `pipe` | 8080 (internal) | YouTube data extraction |
| `post` | 5432 (internal) | Piped Backend database |
| `edu-relay` | 3000 (internal) | Short-form video content relay |

Internal routing in nginx:

| Path | Destination |
|---|---|
| `/api/*` | `pipe` Backend (prefix stripped) |
| `/calculus/*` | `pipe` Backend `/proxy/*` (renamed) |
| `/videoplayback` | `pipe` Backend |
| `/math/*` | Content relay (prefix stripped) |
| `/*` | Frontend static files |

---

## Troubleshooting

**Content relay returns no results**
yt-dlp needs to stay current — update inside the container:
```bash
docker compose exec edu-relay pip install -U yt-dlp
```

**Backend (`pipe`) fails to start**
Check that `POSTGRES_PASSWORD` in `.env` matches `hibernate.connection.password` in
`config/piped.properties`, and that `config/piped.properties` exists (copy from `.example`).

**Videos don't stream**
Verify nginx is running (`docker compose ps`) and that your reverse proxy passes the
original `Host` header through (Caddy does this by default).
