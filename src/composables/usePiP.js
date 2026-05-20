/**
 * Picture-in-Picture helper.
 * Browsers expose this on HTMLVideoElement; we just wrap the calls with checks.
 */

export function isPiPSupported() {
    return typeof document !== "undefined" && "pictureInPictureEnabled" in document;
}

export async function togglePiP(videoEl) {
    if (!videoEl || !isPiPSupported()) return false;
    try {
        if (document.pictureInPictureElement === videoEl) {
            await document.exitPictureInPicture();
        } else {
            await videoEl.requestPictureInPicture();
        }
        return true;
    } catch {
        return false;
    }
}
