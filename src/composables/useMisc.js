import { getPreferenceBoolean, getPreferenceString } from "./usePreferences.js";

export async function updateWatched(videos) {
    if (window.db && getPreferenceBoolean("watchHistory", false)) {
        var tx = window.db.transaction("watch_history", "readonly");
        var store = tx.objectStore("watch_history");
        videos.map(async video => {
            var request = store.get(video.url.substr(-11));
            request.onsuccess = function (event) {
                if (event.target.result) {
                    video.watched = event.target.result.currentTime != 0;
                    video.currentTime = event.target.result.currentTime;
                }
            };
        });
    }
}

export function download(text, filename, mimeType) {
    var file = new Blob([text], { type: mimeType });

    const elem = document.createElement("a");

    elem.href = URL.createObjectURL(file);
    elem.download = filename;
    elem.click();
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
