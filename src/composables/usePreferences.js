export function testLocalStorage() {
    try {
        if (window.localStorage !== undefined) localStorage;
        return true;
    } catch {
        return false;
    }
}

export function setPreference(key, value, disableAlert = false) {
    try {
        localStorage.setItem(key, value);
    } catch {
        if (!disableAlert) alert("Could not save preference to local storage.");
    }
}

export function getPreferenceBoolean(key, defaultVal) {
    var value;
    if (
        (value = new URLSearchParams(window.location.search).get(key)) !== null ||
        (testLocalStorage() && (value = localStorage.getItem(key)) !== null)
    ) {
        switch (String(value).toLowerCase()) {
            case "true":
            case "1":
            case "on":
            case "yes":
                return true;
            default:
                return false;
        }
    } else return defaultVal;
}

export function getPreferenceString(key, defaultVal) {
    var value;
    if (
        (value = new URLSearchParams(window.location.search).get(key)) !== null ||
        (testLocalStorage() && (value = localStorage.getItem(key)) !== null)
    ) {
        return value;
    } else return defaultVal;
}

export function getPreferenceNumber(key, defaultVal) {
    var value;
    if (
        (value = new URLSearchParams(window.location.search).get(key)) !== null ||
        (testLocalStorage() && (value = localStorage.getItem(key)) !== null)
    ) {
        const num = Number(value);
        return isNaN(num) ? defaultVal : num;
    } else return defaultVal;
}

export function getPreferenceJSON(key, defaultVal) {
    var value;
    if (
        (value = new URLSearchParams(window.location.search).get(key)) !== null ||
        (testLocalStorage() && (value = localStorage.getItem(key)) !== null)
    ) {
        return JSON.parse(value);
    } else return defaultVal;
}
