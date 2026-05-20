import { ref } from "vue";

const STORAGE_KEY = "videoBookmarks";

const _store = ref(load());

function load() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {};
    } catch {
        return {};
    }
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(_store.value));
    } catch {
        // storage unavailable
    }
}

/**
 * Per-video timestamp bookmarks with optional notes.
 * Shape: { [videoId]: [{ time, note, ts }] }
 */
export function useBookmarks(videoId) {
    function list() {
        return _store.value[videoId] ?? [];
    }

    function add(time, note = "") {
        const cur = list().slice();
        cur.push({ time: Math.floor(time), note, ts: Date.now() });
        cur.sort((a, b) => a.time - b.time);
        _store.value = { ..._store.value, [videoId]: cur };
        persist();
    }

    function remove(time) {
        const cur = list().filter(b => b.time !== time);
        if (cur.length === 0) {
            const next = { ..._store.value };
            delete next[videoId];
            _store.value = next;
        } else {
            _store.value = { ..._store.value, [videoId]: cur };
        }
        persist();
    }

    function clear() {
        const next = { ..._store.value };
        delete next[videoId];
        _store.value = next;
        persist();
    }

    return { store: _store, list, add, remove, clear };
}

export function getAllBookmarkedVideos() {
    return Object.entries(_store.value).map(([id, marks]) => ({ id, marks }));
}
