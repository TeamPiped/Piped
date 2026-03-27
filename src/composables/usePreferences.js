import { StorageSerializers, useLocalStorage } from "@vueuse/core";

const preferenceRefs = new Map();

export function testLocalStorage() {
    try {
        if (window.localStorage !== undefined) localStorage;
        return true;
    } catch {
        return false;
    }
}

function getQueryPreference(key) {
    return new URLSearchParams(window.location.search).get(key);
}

function getOrCreatePreferenceRef(key, createRef) {
    if (preferenceRefs.has(key)) return preferenceRefs.get(key);

    const preferenceRef = createRef();
    preferenceRefs.set(key, preferenceRef);
    return preferenceRef;
}

function createPreferenceRefForValue(key, valueForTypeInference) {
    if (typeof valueForTypeInference === "string" || valueForTypeInference === undefined)
        return usePreferenceString(key);
    if (typeof valueForTypeInference === "boolean") return usePreferenceBoolean(key);
    if (typeof valueForTypeInference === "number") return usePreferenceNumber(key);
    return usePreferenceJSON(key);
}

export function usePreferenceString(key, defaultVal) {
    const preferenceRef = getOrCreatePreferenceRef(key, () =>
        useLocalStorage(key, defaultVal ?? null, {
            serializer: StorageSerializers.any,
            writeDefaults: false,
        }),
    );

    const queryValue = getQueryPreference(key);
    if (queryValue !== null && preferenceRef.value !== queryValue) {
        preferenceRef.value = queryValue;
    }

    return preferenceRef;
}

export function usePreferenceBoolean(key, defaultVal = false) {
    return getOrCreatePreferenceRef(key, () =>
        useLocalStorage(key, defaultVal, {
            writeDefaults: false,
        }),
    );
}

export function usePreferenceNumber(key, defaultVal = 0) {
    return getOrCreatePreferenceRef(key, () =>
        useLocalStorage(key, defaultVal, {
            writeDefaults: false,
        }),
    );
}

export function usePreferenceJSON(key, defaultVal) {
    return getOrCreatePreferenceRef(key, () =>
        useLocalStorage(key, defaultVal ?? null, {
            serializer: StorageSerializers.object,
            writeDefaults: false,
        }),
    );
}

export function setPreference(key, value, disableAlert = false) {
    try {
        createPreferenceRefForValue(key, value).value = value;
    } catch {
        if (!disableAlert) alert("Could not save preference to local storage.");
    }
}

export function getPreferenceBoolean(key, defaultVal) {
    const queryValue = getQueryPreference(key);
    if (queryValue !== null) {
        switch (String(queryValue).toLowerCase()) {
            case "true":
            case "1":
            case "on":
            case "yes":
                return true;
            default:
                return false;
        }
    }

    if (testLocalStorage()) {
        const value = usePreferenceBoolean(key, defaultVal).value;
        switch (String(value).toLowerCase()) {
            case "true":
            case "1":
            case "on":
            case "yes":
                return true;
            default:
                return false;
        }
    }

    return defaultVal;
}

export function getPreferenceString(key, defaultVal) {
    if (testLocalStorage()) {
        const preferenceRef = usePreferenceString(key, defaultVal);
        const queryValue = getQueryPreference(key);
        if (queryValue !== null && preferenceRef.value !== queryValue) {
            preferenceRef.value = queryValue;
        }

        const value = preferenceRef.value;
        return value ?? defaultVal;
    }

    const queryValue = getQueryPreference(key);
    if (queryValue !== null) return queryValue;

    return defaultVal;
}

export function getPreferenceNumber(key, defaultVal) {
    const queryValue = getQueryPreference(key);
    if (queryValue !== null) {
        const num = Number(queryValue);
        return isNaN(num) ? defaultVal : num;
    }

    if (testLocalStorage()) {
        const value = usePreferenceNumber(key, defaultVal).value;
        const num = Number(value);
        return isNaN(num) ? defaultVal : num;
    }

    return defaultVal;
}

export function getPreferenceJSON(key, defaultVal) {
    const queryValue = getQueryPreference(key);
    if (queryValue !== null) {
        try {
            return JSON.parse(queryValue);
        } catch {
            return defaultVal;
        }
    }

    if (testLocalStorage()) {
        const value = usePreferenceJSON(key, defaultVal).value;
        return value ?? defaultVal;
    }

    return defaultVal;
}
