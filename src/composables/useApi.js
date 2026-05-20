import { getPreferenceBoolean, getPreferenceString } from "./usePreferences.js";

export async function fetchJson(url, params, options) {
    if (params) {
        url = new URL(url);
        for (const param in params) url.searchParams.set(param, params[param]);
    }
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export function hashCode(s) {
    return s.split("").reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a | 0;
    }, 0);
}

export function apiUrl() {
    return getPreferenceString("instance", import.meta.env.VITE_PIPED_API);
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
