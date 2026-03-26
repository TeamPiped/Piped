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
