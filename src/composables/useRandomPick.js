/**
 * "I'm feeling lucky" — pick a random video from the user's subscription feed.
 * Used by RandomPickButton on the Subscriptions / Feed page.
 */

import { fetchJson, apiUrl, getAuthToken } from "./useApi.js";

export async function pickRandomFromFeed() {
    const token = getAuthToken();
    if (!token) return null;
    try {
        const data = await fetchJson(`${apiUrl()}/feed`, null, {
            headers: { Authorization: token },
        });
        const videos = (data ?? []).filter(v => v.url);
        if (videos.length === 0) return null;
        return videos[Math.floor(Math.random() * videos.length)];
    } catch {
        return null;
    }
}

export async function pickRandomFromTrending() {
    try {
        const data = await fetchJson(`${apiUrl()}/trending?region=US`);
        const videos = (data ?? []).filter(v => v.url);
        if (videos.length === 0) return null;
        return videos[Math.floor(Math.random() * videos.length)];
    } catch {
        return null;
    }
}
