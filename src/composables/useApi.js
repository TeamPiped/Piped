import { getPreferenceBoolean, getPreferenceString } from "./usePreferences.js";

export function fetchJson(url, params, options) {
    if (params) {
        url = new URL(url);
        for (var param in params) url.searchParams.set(param, params[param]);
    }
    return fetch(url, options).then(response => {
        return response.json();
    });
}

export function hashCode(s) {
    return s.split("").reduce(function (a, b) {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
    }, 0);
}

function resolveDefaultApiUrl() {
    // Runtime config injected at container start (no rebuild needed)
    const runtimeUrl = window.__PIPED_CONFIG__?.apiUrl;
    if (runtimeUrl && !runtimeUrl.includes("__PIPED_API_URL__")) return runtimeUrl;

    // Build-time env var (pnpm dev with VITE_PIPED_API set)
    const envUrl = import.meta.env.VITE_PIPED_API;
    if (envUrl) return envUrl;

    // Single-domain default: backend served at /api on the same origin
    return window.location.origin + "/api";
}

export function apiUrl() {
    return getPreferenceString("instance", resolveDefaultApiUrl());
}

export function authApiUrl() {
    if (getPreferenceBoolean("authInstance", false)) {
        return getPreferenceString("auth_instance_url", apiUrl());
    } else return apiUrl();
}

export function getAuthToken() {
    return getPreferenceString("authToken" + hashCode(authApiUrl()));
}

export function isAuthenticated() {
    return getAuthToken() !== undefined;
}
