/**
 * Aggregates total watch time per channel from the IndexedDB watch_history store.
 * Used by the StatsPage to show "top channels by hours watched".
 */

export function getChannelStats() {
    return new Promise(resolve => {
        if (!window.db) return resolve([]);
        try {
            const tx = window.db.transaction("watch_history", "readonly");
            const store = tx.objectStore("watch_history");
            const req = store.getAll();
            req.onsuccess = e => {
                const entries = e.target.result ?? [];
                const map = new Map();
                let totalSeconds = 0;
                for (const v of entries) {
                    if (!v.uploaderUrl) continue;
                    const watched = Math.min(v.currentTime ?? 0, v.duration ?? 0);
                    if (watched <= 0) continue;
                    totalSeconds += watched;
                    const cur = map.get(v.uploaderUrl) ?? {
                        url: v.uploaderUrl,
                        name: v.uploaderName ?? "Unknown",
                        seconds: 0,
                        videos: 0,
                    };
                    cur.seconds += watched;
                    cur.videos += 1;
                    map.set(v.uploaderUrl, cur);
                }
                const channels = [...map.values()].sort((a, b) => b.seconds - a.seconds);
                resolve({ totalSeconds, channels, totalVideos: entries.length });
            };
            req.onerror = () => resolve({ totalSeconds: 0, channels: [], totalVideos: 0 });
        } catch {
            resolve({ totalSeconds: 0, channels: [], totalVideos: 0 });
        }
    });
}

export function getRecentChannels(limit = 8) {
    return new Promise(resolve => {
        if (!window.db) return resolve([]);
        try {
            const tx = window.db.transaction("watch_history", "readonly");
            const store = tx.objectStore("watch_history");
            const req = store.getAll();
            req.onsuccess = e => {
                const entries = e.target.result ?? [];
                const seen = new Map();
                for (const v of entries.sort((a, b) => (b.watchedAt ?? 0) - (a.watchedAt ?? 0))) {
                    if (!v.uploaderUrl || seen.has(v.uploaderUrl)) continue;
                    seen.set(v.uploaderUrl, {
                        url: v.uploaderUrl,
                        name: v.uploaderName ?? "Unknown",
                        avatar: v.uploaderAvatar ?? null,
                        lastWatched: v.watchedAt,
                    });
                    if (seen.size >= limit) break;
                }
                resolve([...seen.values()]);
            };
            req.onerror = () => resolve([]);
        } catch {
            resolve([]);
        }
    });
}
