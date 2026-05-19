import { fetchJson, apiUrl, authApiUrl, getAuthToken, isAuthenticated } from "./useApi.js";
import { getUnauthenticatedChannels } from "./useSubscriptions.js";
import { getPreferenceString } from "./usePreferences.js";

function tokenize(title = "") {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 3);
}

function getWatchHistory() {
    return new Promise(resolve => {
        if (!window.db) return resolve([]);
        const tx = window.db.transaction("watch_history", "readonly");
        const store = tx.objectStore("watch_history");
        const req = store.index("watchedAt").getAll();
        req.onsuccess = () => resolve((req.result ?? []).slice(-100).reverse());
        req.onerror = () => resolve([]);
    });
}

export async function fetchRecommended() {
    const history = await getWatchHistory();
    const watchedIds = new Set(history.map(v => v.videoId));

    // channel affinity: how often each channel appears in history
    const channelScore = {};
    const historyTokens = [];
    for (const v of history) {
        if (v.uploaderUrl) {
            const id = v.uploaderUrl.replace(/.*\//, "");
            channelScore[id] = (channelScore[id] ?? 0) + 1;
        }
        historyTokens.push(...tokenize(v.title));
    }
    const topicFreq = {};
    for (const t of historyTokens) topicFreq[t] = (topicFreq[t] ?? 0) + 1;

    const region = getPreferenceString("region", "US");

    // fetch trending + subscription feed in parallel
    const [trendingResult, feedResult] = await Promise.allSettled([
        fetchJson(apiUrl() + "/trending", { region }),
        isAuthenticated()
            ? fetchJson(authApiUrl() + "/feed", { authToken: getAuthToken() })
            : (() => {
                  const channels = getUnauthenticatedChannels();
                  if (!channels) return Promise.resolve([]);
                  const split = channels.split(",");
                  if (split.length > 100)
                      return fetchJson(authApiUrl() + "/feed/unauthenticated", null, {
                          method: "POST",
                          body: JSON.stringify(split),
                      });
                  return fetchJson(authApiUrl() + "/feed/unauthenticated", { channels });
              })(),
    ]);

    const trending = trendingResult.status === "fulfilled" ? (trendingResult.value ?? []) : [];
    const feed = feedResult.status === "fulfilled" ? (feedResult.value ?? []) : [];

    // deduplicate by URL
    const seen = new Set();
    const pool = [];
    for (const v of [...feed, ...trending]) {
        if (!v?.url) continue;
        if (seen.has(v.url)) continue;
        seen.add(v.url);
        pool.push({ ...v, _fromFeed: feed.includes(v) });
    }

    const now = Date.now();
    function score(v) {
        let s = 0;

        // penalize already-watched
        const vid = v.url?.substr(-11);
        if (watchedIds.has(vid)) s -= 10;

        // channel affinity bonus
        const chanId = v.uploaderUrl?.replace(/.*\//, "");
        if (chanId && channelScore[chanId]) s += Math.min(channelScore[chanId] * 2, 10);

        // topic similarity
        const tokens = tokenize(v.title);
        for (const t of tokens) s += (topicFreq[t] ?? 0) * 0.5;

        // recency: uploaded within 7 days +3, 30 days +1
        if (v.uploaded) {
            const age = now - v.uploaded;
            if (age < 7 * 86400000) s += 3;
            else if (age < 30 * 86400000) s += 1;
        }

        // subscription feed bonus
        if (v._fromFeed) s += 3;

        // view-count normalization: log scale
        if (v.views > 0) s += Math.log10(v.views) * 0.3;

        return s;
    }

    pool.sort((a, b) => score(b) - score(a));

    // shuffle top-scored segments to avoid rigid ordering
    function shuffleSlice(arr, start, end) {
        for (let i = end - 1; i > start; i--) {
            const j = start + Math.floor(Math.random() * (i - start + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    const top = Math.min(20, Math.floor(pool.length * 0.3));
    if (top > 1) shuffleSlice(pool, 0, top);

    return pool;
}
