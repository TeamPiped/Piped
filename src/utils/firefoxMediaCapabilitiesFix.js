/**
 * HACK: Firefox-only fast path for navigator.mediaCapabilities.decodingInfo().
 *
 * Rough comparison: Chromium ~0.1 ms/call vs Firefox ~20 ms/call.
 * Shaka calls decodingInfo once per Variant while filtering the manifest, so on
 * a YouTube-shape manifest with many Variants Firefox stalls several seconds at
 * player init before any SourceBuffer is added.
 *
 * This module delegates "supported" to MediaSource.isTypeSupported (sub-ms on
 * Firefox) and synthesizes smooth = powerEfficient = supported.
 *
 * KNOWN DOWNSIDE: by forcing smooth and powerEfficient to true we discard the
 * native signals Shaka would otherwise see. If anything in the player chain
 * reads those fields (e.g. preferredDecodingAttributes is set, a downstream
 * consumer ranks variants on power efficiency, or a Shaka upgrade changes
 * filtering), this shim will cause Shaka to pick streams the device cannot
 * decode in real time — frame drops, software-decode CPU spikes, battery
 * drain. Today (Shaka 5.1, Piped default config) those fields are not read
 * and the shim is harmless; revisit on every Shaka upgrade.
 *
 * Active only on Gecko engines, so Chromium / Safari / Edge / iOS Firefox
 * (WebKit) are unaffected. DRM probes (keySystemConfiguration) and non-
 * media-source query types fall through to the native API unchanged.
 *
 * Refs: https://github.com/TeamPiped/Piped/issues/4238
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
