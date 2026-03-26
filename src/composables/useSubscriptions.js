import { fetchJson, apiUrl, authApiUrl, getAuthToken, isAuthenticated } from "./useApi.js";
import { getPreferenceBoolean } from "./usePreferences.js";

export function getLocalSubscriptions() {
    try {
        return JSON.parse(localStorage.getItem("localSubscriptions"));
    } catch {
        return [];
    }
}

export function isSubscribedLocally(channelId) {
    const localSubscriptions = getLocalSubscriptions();
    if (localSubscriptions == null) return false;
    return localSubscriptions.includes(channelId);
}

export function handleLocalSubscriptions(channelId) {
    var localSubscriptions = getLocalSubscriptions() ?? [];
    if (localSubscriptions.includes(channelId)) localSubscriptions.splice(localSubscriptions.indexOf(channelId), 1);
    else localSubscriptions.push(channelId);
    // Sort for better cache hits
    localSubscriptions.sort();
    try {
        localStorage.setItem("localSubscriptions", JSON.stringify(localSubscriptions));
        return true;
    } catch {
        alert("Could not save subscriptions to local storage.");
    }
    return false;
}

export function getUnauthenticatedChannels() {
    const localSubscriptions = getLocalSubscriptions() ?? [];
    return localSubscriptions.join(",");
}

export async function fetchSubscriptions() {
    if (isAuthenticated()) {
        return await fetchJson(authApiUrl() + "/subscriptions", null, {
            headers: {
                Authorization: getAuthToken(),
            },
        });
    } else {
        const channels = getUnauthenticatedChannels();
        const split = channels.split(",");
        if (split.length > 100) {
            return await fetchJson(authApiUrl() + "/subscriptions/unauthenticated", null, {
                method: "POST",
                body: JSON.stringify(split),
            });
        } else {
            return await fetchJson(authApiUrl() + "/subscriptions/unauthenticated", {
                channels: getUnauthenticatedChannels(),
            });
        }
    }
}

export async function fetchFeed() {
    if (isAuthenticated()) {
        return await fetchJson(authApiUrl() + "/feed", {
            authToken: getAuthToken(),
        });
    } else {
        const channels = getUnauthenticatedChannels();
        const split = channels.split(",");
        if (split.length > 100) {
            return await fetchJson(authApiUrl() + "/feed/unauthenticated", null, {
                method: "POST",
                body: JSON.stringify(split),
            });
        } else {
            return await fetchJson(authApiUrl() + "/feed/unauthenticated", {
                channels: channels,
            });
        }
    }
}

export async function fetchSubscriptionStatus(channelId) {
    if (!isAuthenticated()) {
        return isSubscribedLocally(channelId);
    }

    const response = await fetchJson(
        authApiUrl() + "/subscribed",
        {
            channelId: channelId,
        },
        {
            headers: {
                Authorization: getAuthToken(),
            },
        },
    );

    return response?.subscribed;
}

export async function toggleSubscriptionState(channelId, subscribed) {
    if (!isAuthenticated()) return handleLocalSubscriptions(channelId);

    const resp = await fetchJson(authApiUrl() + (subscribed ? "/unsubscribe" : "/subscribe"), null, {
        method: "POST",
        body: JSON.stringify({
            channelId: channelId,
        }),
        headers: {
            Authorization: getAuthToken(),
            "Content-Type": "application/json",
        },
    });

    return !resp.error;
}

export function fetchDeArrowContent(content) {
    if (!getPreferenceBoolean("dearrow", false)) return;

    const videoIds = content
        .filter(item => item.type === "stream")
        .map(item => item.url.substr(-11))
        .sort();

    if (videoIds.length === 0) return;

    fetchJson(apiUrl() + "/dearrow", {
        videoIds: videoIds.join(","),
    }).then(json => {
        Object.keys(json).forEach(videoId => {
            const item = content.find(item => item.url.endsWith(videoId));
            if (item) item.dearrow = json[videoId];
        });
    });
}
