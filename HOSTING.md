# Hosting Piped

This guide covers three ways to run your own Piped instance:

1. [Docker Compose (recommended)](#docker-compose-recommended)
2. [GitHub Codespaces](#github-codespaces)
3. [Local / npm dev setup](#local--npm-dev-setup)

---

## Architecture overview

```
Browser
  └─► Caddy (port 80/443)
        ├─ /api/*         → Piped Backend (Java / NewPipe Extractor)
        ├─ /tiktok/*      → TikTok proxy (Node.js + yt-dlp)
        └─ /*             → Frontend (nginx static)

PostgreSQL ← Piped Backend
```

All services run in Docker containers and communicate over an internal network.  
Caddy terminates TLS and provisions certificates automatically via Let's Encrypt.

---

## Docker Compose (recommended)

### Prerequisites

- Docker Engine 24+ and Docker Compose v2
- A domain name pointing to your server (for public HTTPS)
- Ports 80 and 443 open on your firewall

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_FORK/Piped.git
cd Piped
```

**2. Create your Piped Backend config**

```bash
cp config/piped.properties.example config/piped.properties
```

Open `config/piped.properties` and replace `piped.example.com` with your actual domain.  
Also set a strong `hibernate.connection.password` (must match `POSTGRES_PASSWORD` below).

**3. Create a `.env` file**

```bash
cat > .env <<'EOF'
# Your public domain – Caddy provisions TLS automatically
PIPED_DOMAIN=piped.example.com

# Optional: email for Let's Encrypt expiry notices
ACME_EMAIL=you@example.com

# Must match hibernate.connection.password in config/piped.properties
POSTGRES_PASSWORD=changeme
EOF
```

For local testing without a domain, omit `PIPED_DOMAIN` (or set it to `localhost`).  
Caddy will use a self-signed certificate accessible at `https://localhost`.

**4. Start the stack**

```bash
docker compose up -d
```

Watch the logs:

```bash
docker compose logs -f
```

**5. Open your browser**

Navigate to `https://piped.example.com` (or `https://localhost`).

### Updating

```bash
docker compose pull          # pull latest images
docker compose up -d --build # rebuild frontend + TikTok proxy, restart all
```

### Data

- PostgreSQL data: `postgres_data` Docker volume (survives container restarts)
- Caddy TLS certs: `caddy_data` Docker volume

---

## GitHub Codespaces

Codespaces gives you a full dev environment in the browser with no local install required.

**1. Open the repo in Codespaces**

Click **Code → Codespaces → Create codespace on main** (or your branch).

**2. Wait for the container to start**, then in the integrated terminal:

```bash
pnpm install
```

**3. Start the frontend dev server**

```bash
pnpm dev
```

Vite will print a `localhost:5173` URL. Codespaces auto-forwards the port — click the  
**Ports** tab and open the forwarded URL.

**4. (Optional) Run the TikTok proxy**

In a second terminal tab:

```bash
cd server
npm install
# yt-dlp must be available: pip install yt-dlp
npm start
```

The Vite dev server automatically proxies `/tiktok/*` to `localhost:3000`.

**5. (Optional) Run Piped Backend**

If you want real YouTube data instead of the public demo API, start the backend too:

```bash
# Requires Docker inside Codespaces
docker compose up pipedapi postgres -d
```

Then set `VITE_PIPED_API=http://localhost:8080` in `.env` (create it if missing).

---

## Local / npm dev setup

### Prerequisites

- Node.js 20+ and pnpm (`npm install -g pnpm`)
- Python 3 and yt-dlp (`pip install yt-dlp`) – for TikTok features
- (Optional) Java 21 + Docker – for the Piped Backend

### Steps

**1. Install frontend dependencies**

```bash
pnpm install
```

**2. Configure the API endpoint** (optional)

By default the frontend calls `window.location.origin/api` which is correct for Docker.  
For dev, you can point it at the public Piped API or your own backend:

```bash
# .env (create if missing)
VITE_PIPED_API=https://pipedapi.kavin.rocks
```

**3. Start the dev server**

```bash
pnpm dev
```

Frontend is available at `http://localhost:5173`.

**4. Start the TikTok proxy** (in another terminal)

```bash
cd server
npm install
npm start          # listens on :3000
```

Vite proxies `/tiktok/*` → `http://localhost:3000` automatically.

**5. Production build**

```bash
pnpm build
# Output in dist/
```

Serve `dist/` from any static file host (nginx, Caddy, Netlify, GitHub Pages, etc.).

---

## Caddy configuration

The `Caddyfile` in the repo root is used by the Docker Compose setup. For a standalone  
Caddy deployment (without Docker Compose) you can use it directly:

**Install Caddy** – https://caddyserver.com/docs/install

**Edit the Caddyfile** and replace the `{$PIPED_DOMAIN:localhost}` block label with your  
actual domain:

```caddy
piped.example.com {
    # ... same routes as in the Caddyfile ...
}
```

Then run each service manually and point Caddy's `reverse_proxy` targets to their  
actual addresses (e.g. `127.0.0.1:8080` instead of `pipedapi:8080`).

```bash
caddy run --config Caddyfile
```

### Environment variables for Caddy

| Variable | Default | Description |
|---|---|---|
| `PIPED_DOMAIN` | `localhost` | Public domain (triggers automatic TLS when set to a real domain) |
| `ACME_EMAIL` | _(empty)_ | Email for Let's Encrypt renewal notices |

---

## Environment variables reference

### docker-compose / frontend container

| Variable | Description |
|---|---|
| `PIPED_DOMAIN` | Your domain name, e.g. `piped.example.com` |
| `BACKEND_URL` | Full backend URL (default: `https://<PIPED_DOMAIN>/api`) |
| `BACKEND_HOSTNAME` | Legacy: hostname only (constructs URL as `https://<hostname>`) |
| `HTTP_MODE` | `https` (default) or `http` (for `BACKEND_HOSTNAME` only) |
| `POSTGRES_PASSWORD` | Database password (must match `config/piped.properties`) |
| `ACME_EMAIL` | Optional Let's Encrypt contact email |

### TikTok proxy container (`server/`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the proxy listens on |

---

## Troubleshooting

**TikTok returns no videos**  
TikTok actively blocks scrapers. yt-dlp needs to be up to date:  
```bash
docker compose exec tiktok-proxy pip install -U yt-dlp
```

**Certificate errors on localhost**  
Caddy issues a local self-signed cert for `localhost`. Add your browser's exception or  
install the Caddy root CA: `caddy trust`.

**Piped Backend won't start**  
Check that `config/piped.properties` exists and `API_URL` / `FRONTEND_URL` match your  
domain exactly. Also verify the PostgreSQL password matches `POSTGRES_PASSWORD`.

**Videos don't load (CORS errors)**  
Make sure `PROXY_PART` in `config/piped.properties` matches your domain.  
The frontend and backend must be served from the same origin OR CORS must be configured.
