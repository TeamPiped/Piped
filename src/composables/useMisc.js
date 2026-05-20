import { getPreferenceBoolean, getPreferenceString } from "./usePreferences.js";

export async function updateWatched(videos) {
    if (window.db && getPreferenceBoolean("watchHistory", false)) {
        const tx = window.db.transaction("watch_history", "readonly");
        const store = tx.objectStore("watch_history");
        videos.forEach(async video => {
            const videoId = video.url.slice(-11);
            const request = store.get(videoId);
            request.onsuccess = event => {
                const result = event.target.result;
                if (result) {
                    video.watched = result.currentTime !== 0;
                    video.currentTime = result.currentTime;
                }
            };
        });
    }
}

export function download(text, filename, mimeType) {
    const file = new Blob([text], { type: mimeType });

    const elem = document.createElement("a");

    elem.href = URL.createObjectURL(file);
    elem.download = filename;
    elem.click();
    URL.revokeObjectURL(elem.href);
    elem.remove();
}

export function getHomePage() {
    switch (getPreferenceString("homepage", "trending")) {
        case "trending":
            return "/trending";
        case "feed":
            return "/feed";
        default:
            return undefined;
    }
}
