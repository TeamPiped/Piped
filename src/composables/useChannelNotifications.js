/**
 * Opt-in browser notifications for channel uploads.
 * Channels marked here are polled by a background fetch (called from App.vue).
 */

import { ref } from "vue";
import { fetchJson, apiUrl } from "./useApi.js";

const STORAGE_KEY = "channelNotifications";
const SEEN_KEY = "channelNotificationSeen";
const POLL_MS = 15 * 60 * 1000; // 15 min

const _channels = ref(load(STORAGE_KEY));
const _seen = ref(load(SEEN_KEY));

function load(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? {};
    } catch {
        return {};
    }
}

function persist(key, val) {
    try {
        localStorage.setItem(key, JSON.stringify(val));
    } catch {
        // ignore
    }
}

export async function requestPermission() {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    return Notification.requestPermission();
}

export function useChannelNotifications() {
    function isEnabled(channelId) {
        return Boolean(_channels.value[channelId]);
    }

    async function enable(channelId, name) {
        const perm = await requestPermission();
        if (perm !== "granted") return false;
        _channels.value = { ..._channels.value, [channelId]: { name, enabledAt: Date.now() } };
        persist(STORAGE_KEY, _channels.value);
        return true;
    }

    function disable(channelId) {
        const next = { ..._channels.value };
        delete next[channelId];
        _channels.value = next;
        persist(STORAGE_KEY, _channels.value);
    }

    return { channels: _channels, isEnabled, enable, disable };
}

/**
 * Background poller — call once from App.vue onMounted.
 */
export function startNotificationPoller() {
    if (window.__pipedNotifPoller) return;
    window.__pipedNotifPoller = setInterval(checkAll, POLL_MS);
    // Also check on startup after a short delay
    setTimeout(checkAll, 5000);
}

async function checkAll() {
    if (Notification.permission !== "granted") return;
    const channels = _channels.value;
    for (const [id, meta] of Object.entries(channels)) {
        try {
            const data = await fetchJson(`${apiUrl()}/channel/${id}`);
            const latest = data.relatedStreams?.[0];
            if (!latest) continue;
            const seenKey = `${id}:${latest.url}`;
            if (_seen.value[seenKey]) continue;
            _seen.value = { ..._seen.value, [seenKey]: Date.now() };
            persist(SEEN_KEY, _seen.value);
            new Notification(`${meta.name} uploaded a new video`, {
                body: latest.title,
                icon: latest.thumbnail,
                tag: latest.url,
            });
        } catch {
            // channel unreachable, try next poll
        }
    }
}
