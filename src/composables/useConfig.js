import { ref } from "vue";
import { fetchJson, apiUrl, authApiUrl } from "./useApi.js";

const configRefs = new Map();
const configRequests = new Map();

function fetchConfig(url) {
    if (!configRefs.has(url)) {
        configRefs.set(url, ref(null));
        configRequests.set(
            url,
            fetchJson(url + "/config").then(data => {
                configRefs.get(url).value = data;
                return data;
            }),
        );
    }
    return configRefs.get(url);
}

export function useConfig() {
    return {
        config: fetchConfig(apiUrl()),
        // When the auth instance is the same as the regular instance the URLs
        // match, so this returns the same ref and only one request is made.
        authConfig: fetchConfig(authApiUrl()),
    };
}
