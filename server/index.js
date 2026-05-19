import express from "express";
import { spawn } from "child_process";
import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { URL } from "url";

const app = express();
const PORT = process.env.PORT ?? 3000;

// Allowed TikTok CDN hostnames for the stream proxy
const TIKTOK_CDN_HOSTS = [
    "tiktokcdn.com",
    "tiktokcdn-us.com",
    "tiktokv.com",
    "tiktokv-us.com",
    "muscdn.com",
    "musical.ly",
    "tiktok.com",
    "byteoversea.com",
    "ibytedtos.com",
];

// CORS for the Vite dev server
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
});

// ── yt-dlp helpers ─────────────────────────────────────────────────────────────

function ytdlpArgs(extra = []) {
    return [
        "--no-warnings",
        "--no-check-certificates",
        "--user-agent",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        ...extra,
    ];
}

/** Run yt-dlp on a single URL, return parsed JSON. */
function ytdlpJson(url, extra = []) {
    return new Promise((resolve, reject) => {
        const args = ytdlpArgs(["--dump-json", "--no-playlist", ...extra, url]);
        const proc = spawn("yt-dlp", args, { timeout: 45_000 });
        let out = "";
        let err = "";
        proc.stdout.on("data", (d) => (out += d));
        proc.stderr.on("data", (d) => (err += d));
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code !== 0) return reject(new Error(err.trim() || `yt-dlp exited ${code}`));
            try {
                resolve(JSON.parse(out.trim()));
            } catch {
                reject(new Error("yt-dlp returned invalid JSON"));
            }
        });
    });
}

/** Run yt-dlp on a playlist URL, return parsed JSON (single-json mode). */
function ytdlpPlaylist(url, count = 20) {
    return new Promise((resolve, reject) => {
        const args = ytdlpArgs([
            "--flat-playlist",
            "--dump-single-json",
            "-I",
            `1:${count}`,
            url,
        ]);
        const proc = spawn("yt-dlp", args, { timeout: 60_000 });
        let out = "";
        let err = "";
        proc.stdout.on("data", (d) => (out += d));
        proc.stderr.on("data", (d) => (err += d));
        proc.on("error", reject);
        proc.on("close", (code) => {
            if (code !== 0) return reject(new Error(err.trim() || `yt-dlp exited ${code}`));
            try {
                resolve(JSON.parse(out.trim()));
            } catch {
                reject(new Error("yt-dlp returned invalid JSON"));
            }
        });
    });
}

// ── Normalisation ───────────────────────────────────────────────────────────────

/** Extract hashtags from text, e.g. "#cats" → "cats". */
function extractHashtags(text = "") {
    return (text.match(/#(\w+)/g) ?? []).map(h => h.slice(1).toLowerCase());
}

/**
 * Convert a yt-dlp entry (flat-playlist or full) into the common video shape
 * expected by TikTokFeed.vue.
 */
function normalizeEntry(e, opts = {}) {
    // Thumbnail: prefer the last (usually largest) thumbnail
    let cover = e.thumbnail ?? null;
    if (!cover && Array.isArray(e.thumbnails) && e.thumbnails.length) {
        cover = e.thumbnails[e.thumbnails.length - 1]?.url ?? null;
    }

    // Tags: combine yt-dlp tags with hashtags found in title/description
    const rawTags = Array.isArray(e.tags) ? e.tags.map(t => t.toLowerCase()) : [];
    const inlineTags = extractHashtags(`${e.title ?? ""} ${e.description ?? ""}`);
    const tags = [...new Set([...rawTags, ...inlineTags])];

    // Stream URL from formats list – prefer mp4, max 720p, avoid watermarked variants
    let playUrl = null;
    if (Array.isArray(e.formats)) {
        const mp4 = e.formats
            .filter((f) => f.ext === "mp4" && f.url && !f.format_id?.includes("watermark"))
            .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
            .find((f) => (f.height ?? 9999) <= 720);
        const best = mp4 ?? e.formats.find((f) => f.url);
        if (best?.url) {
            playUrl = `/stream?url=${encodeURIComponent(best.url)}`;
        }
    }

    return {
        id: e.id ?? e.display_id ?? null,
        title: e.title ?? e.description ?? "",
        tags,
        author: {
            nickname: e.uploader ?? e.channel ?? "Unknown",
            uniqueId: (e.uploader_id ?? e.channel_id ?? "").replace(/^@/, ""),
            avatarUrl: null,
        },
        stats: {
            plays: e.view_count ?? 0,
            likes: e.like_count ?? 0,
            comments: e.comment_count ?? 0,
        },
        video: {
            cover,
            playUrl: opts.proxyStream ? playUrl : (e.url ?? playUrl),
        },
        webpageUrl: e.webpage_url ?? e.url ?? null,
    };
}

// ── Routes ──────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => res.json({ ok: true }));

/**
 * GET /trending?count=20
 * Pulls from a mix of trending hashtag pages and shuffles results.
 */
app.get("/trending", async (req, res) => {
    const count = Math.min(parseInt(req.query.count) || 20, 60);
    const tags = ["fyp", "viral", "trending"];
    const perTag = Math.ceil(count / tags.length);

    const results = await Promise.allSettled(
        tags.map((tag) =>
            ytdlpPlaylist(`https://www.tiktok.com/tag/${tag}`, perTag),
        ),
    );

    const seen = new Set();
    const videos = [];

    for (const r of results) {
        if (r.status !== "fulfilled") continue;
        for (const e of r.value.entries ?? []) {
            if (e.id && !seen.has(e.id)) {
                seen.add(e.id);
                videos.push(normalizeEntry(e));
            }
        }
    }

    // Light shuffle so not all #fyp comes first
    for (let i = videos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [videos[i], videos[j]] = [videos[j], videos[i]];
    }

    res.json({ videos: videos.slice(0, count) });
});

/**
 * GET /foryou?count=20
 * Without TikTok authentication a real personalised feed is not possible.
 * We serve trending content instead, which is honest and functional.
 */
app.get("/foryou", async (req, res) => {
    req.url = `/trending${req.url.includes("?") ? req.url.slice(req.url.indexOf("?") - 1) : ""}`;
    // Re-dispatch to /trending handler
    app.handle(req, res);
});

/**
 * GET /search?q=cats&count=20
 * Searches TikTok. Accepts plain keywords or #hashtag queries.
 * Falls back to a hashtag page if the search URL fails.
 */
app.get("/search", async (req, res) => {
    const q = (req.query.q ?? "").trim();
    if (!q) return res.status(400).json({ error: "Missing query parameter q" });

    const count = Math.min(parseInt(req.query.count) || 20, 60);

    let data = null;
    const tag = q.replace(/^#/, "");

    // Try TikTok search URL first (yt-dlp TikTokSearchIE)
    try {
        data = await ytdlpPlaylist(
            `https://www.tiktok.com/search/video?q=${encodeURIComponent(q)}`,
            count,
        );
    } catch {
        // Fallback: treat the query as a hashtag
        try {
            data = await ytdlpPlaylist(
                `https://www.tiktok.com/tag/${encodeURIComponent(tag)}`,
                count,
            );
        } catch (err) {
            return res.status(502).json({ error: err.message });
        }
    }

    const videos = (data?.entries ?? []).map(normalizeEntry);
    res.json({ videos });
});

/**
 * GET /video?url=<tiktok_url>
 * Returns full metadata + stream URL for a single TikTok video.
 */
app.get("/video", async (req, res) => {
    const url = (req.query.url ?? "").trim();
    if (!url) return res.status(400).json({ error: "Missing url parameter" });

    try {
        const info = await ytdlpJson(url);
        res.json(normalizeEntry(info, { proxyStream: true }));
    } catch (err) {
        res.status(502).json({ error: err.message });
    }
});

/**
 * GET /stream?url=<cdn_url>
 * Proxies a TikTok CDN video stream through the server to:
 *  - Avoid browser CORS blocks on signed CDN URLs
 *  - Supply required Referer / User-Agent headers
 *  - Support range requests for seeking
 */
app.get("/stream", (req, res) => {
    const rawUrl = (req.query.url ?? "").trim();
    if (!rawUrl) return res.status(400).json({ error: "Missing url parameter" });

    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        return res.status(400).json({ error: "Invalid URL" });
    }

    // Safety: only proxy known TikTok CDN domains
    const allowed = TIKTOK_CDN_HOSTS.some((h) => parsed.hostname.endsWith(h));
    if (!allowed) {
        return res.status(403).json({ error: "URL is not from a TikTok CDN" });
    }

    const reqFn = parsed.protocol === "https:" ? httpsRequest : httpRequest;
    const upstream = reqFn(
        rawUrl,
        {
            method: "GET",
            headers: {
                "user-agent":
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                referer: "https://www.tiktok.com/",
                origin: "https://www.tiktok.com",
                range: req.headers.range ?? "bytes=0-",
            },
        },
        (upstreamRes) => {
            // Forward relevant headers
            const forward = [
                "content-type",
                "content-length",
                "accept-ranges",
                "content-range",
                "last-modified",
                "etag",
            ];
            res.status(upstreamRes.statusCode ?? 200);
            res.setHeader("Access-Control-Allow-Origin", "*");
            for (const h of forward) {
                if (upstreamRes.headers[h]) res.setHeader(h, upstreamRes.headers[h]);
            }
            upstreamRes.pipe(res);
        },
    );

    upstream.on("error", (err) => {
        if (!res.headersSent) res.status(502).json({ error: err.message });
    });

    // If the client disconnects early, abort the upstream request
    req.on("close", () => upstream.destroy());
    upstream.end();
});

// ── Start ───────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`TikTok proxy listening on :${PORT}`);
});
