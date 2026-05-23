/**
 * Workaround for shaka-project/shaka-player#4775.
 *
 * Firefox's navigator.mediaCapabilities.decodingInfo() costs ~14 ms per call
 * (out-of-process decoder probe). Shaka calls it once per Variant in the DASH
 * manifest while filtering supported variants; YouTube manifests routinely
 * have 1000+ variants, so player initialization stalls 15-20 s on Gecko-based
 * browsers before any SourceBuffer is added or any segment is fetched.
 *
 * This module delegates the "supported" check to MediaSource.isTypeSupported
 * (sub-ms on Firefox) and caches the result per MIME string. Smooth /
 * powerEfficient are returned conservatively as true; Shaka's ABR will
 * downshift if real playback isn't smooth.
 *
 * Active only on Gecko engines, so Chromium / Safari / Edge / iOS Firefox
 * (WebKit) are unaffected. DRM probes (keySystemConfiguration) and non-
 * media-source query types fall through to the native API unchanged.
 *
 * Remove this module (and its import in main.js) once Shaka ships a caching
 * fix for #4775.
 */
if (
    typeof navigator !== "undefined" &&
    /Gecko\/[0-9]/.test(navigator.userAgent) &&
    navigator.mediaCapabilities &&
    typeof navigator.mediaCapabilities.decodingInfo === "function"
) {
    const orig = navigator.mediaCapabilities.decodingInfo.bind(navigator.mediaCapabilities);
    const cache = new Map();
    const mimeOk = mime => {
        if (!cache.has(mime)) cache.set(mime, MediaSource.isTypeSupported(mime));
        return cache.get(mime);
    };
    navigator.mediaCapabilities.decodingInfo = function (config) {
        if (config && config.type === "media-source" && !config.keySystemConfiguration) {
            const v = config.video;
            const a = config.audio;
            const supported = (!v || mimeOk(v.contentType)) && (!a || mimeOk(a.contentType));
            return Promise.resolve({
                supported,
                smooth: supported,
                powerEfficient: supported,
                keySystemAccess: null,
                configuration: config,
            });
        }
        return orig(config);
    };
}
