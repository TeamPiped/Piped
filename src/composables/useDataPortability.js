/**
 * One-click export/import of all locally stored Piped data:
 *  - Preferences (localStorage)
 *  - Queue, Watch Later, Favorites, Bookmarks, Collections, Subscription groups
 *  - Custom theme, sleep timer state
 *
 * Watch history (IndexedDB) is optionally included as a snapshot.
 */

const LOCAL_KEYS = [
    "watchQueue",
    "watchLater",
    "favorites",
    "videoBookmarks",
    "videoNotes",
    "pipedCollections",
    "channelGroups",
    "accentColor",
    "edu_watch_history",
    "tt_watch_history",
];

function readLocalStorageAll() {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        out[k] = localStorage.getItem(k);
    }
    return out;
}

async function readWatchHistory() {
    if (!window.db) return [];
    return new Promise(resolve => {
        try {
            const tx = window.db.transaction("watch_history", "readonly");
            const store = tx.objectStore("watch_history");
            const req = store.getAll();
            req.onsuccess = e => resolve(e.target.result ?? []);
            req.onerror = () => resolve([]);
        } catch {
            resolve([]);
        }
    });
}

export async function exportAll() {
    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        localStorage: readLocalStorageAll(),
        watchHistory: await readWatchHistory(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `piped-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function importAll(file, opts = { mergeHistory: true }) {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || typeof data !== "object") throw new Error("Invalid backup file");

    // Restore localStorage
    if (data.localStorage) {
        for (const [k, v] of Object.entries(data.localStorage)) {
            try {
                localStorage.setItem(k, v);
            } catch {
                // storage limits or unavailable
            }
        }
    }

    // Restore watch history into IndexedDB
    if (opts.mergeHistory && Array.isArray(data.watchHistory) && window.db) {
        await new Promise(resolve => {
            const tx = window.db.transaction("watch_history", "readwrite");
            const store = tx.objectStore("watch_history");
            for (const entry of data.watchHistory) {
                try {
                    store.put(entry);
                } catch {
                    // skip malformed entries
                }
            }
            tx.oncomplete = resolve;
            tx.onerror = resolve;
        });
    }

    return { restoredKeys: Object.keys(data.localStorage ?? {}).length };
}

export function clearAllLocal() {
    for (const k of LOCAL_KEYS) {
        try {
            localStorage.removeItem(k);
        } catch {
            // ignore
        }
    }
}
