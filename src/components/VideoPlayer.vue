<template>
    <div
        ref="container"
        data-shaka-player-container
        class="relative max-h-screen w-full flex justify-center"
        :class="{ 'player-container': !isEmbed }"
    >
        <video
            ref="videoEl"
            class="w-full"
            data-shaka-player
            :autoplay="shouldAutoPlay"
            :loop="selectedAutoLoop"
            playsinline
        />
        <button
            v-if="inSegment"
            class="skip-segment-button"
            type="button"
            :aria-label="$t('actions.skip_segment')"
            aria-pressed="false"
            @click="onClickSkipSegment"
        >
            <span v-t="'actions.skip_segment'" />
            <i class="skip-segment-icon i-fa6-solid:forward-step" aria-hidden="true" />
        </button>
        <span
            v-if="error > 0"
            v-t="{ path: 'player.failed', args: [error] }"
            class="absolute top-8 rounded bg-black/80 p-2 text-lg backdrop-blur-sm"
        />
        <div
            v-if="showCurrentSpeed"
            class="text-l absolute left-1/2 top-1/2 flex flex-col transform items-center gap-6 rounded-8 bg-white/80 px-8 py-4 -translate-x-1/2 -translate-y-1/2 .dark:bg-dark-700/80"
        >
            <i class="i-fa6-solid:gauge-high h-25 w-25 p-5" />
            <span v-text="videoEl.playbackRate" />
        </div>
        <div
            v-if="showCurrentVolume"
            class="text-l absolute left-1/2 top-1/2 flex flex-col transform items-center gap-6 rounded-8 bg-white/80 px-8 py-4 -translate-x-1/2 -translate-y-1/2 .dark:bg-dark-700/80"
        >
            <i v-if="videoEl.volume > 0" class="i-fa6-solid:volume-high h-25 w-25 p-5" />
            <i v-else class="i-fa6-solid:volume-xmark h-25 w-25 p-5" />
            <span v-text="Math.round(videoEl.volume * 100) / 100" />
        </div>
    </div>

    <ModalComponent v-if="showSpeedModal" @close="showSpeedModal = false">
        <h2 v-t="'actions.playback_speed'" />
        <div class="flex flex-col">
            <input
                v-model="playbackSpeedInput"
                class="input my-3"
                type="text"
                :placeholder="$t('actions.playback_speed')"
                @keyup.enter="setSpeedFromInput()"
            />
            <button v-t="'actions.okay'" class="btn ml-auto w-min" @click="setSpeedFromInput()" />
        </div>
    </ModalComponent>
</template>

<script setup>
import "shaka-player/dist/controls.css";
import { ref, computed, onMounted, onActivated, onDeactivated, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { parseTimeParam } from "@/utils/Misc";
import ModalComponent from "./ModalComponent.vue";
import {
    getPreferenceBoolean,
    getPreferenceNumber,
    getPreferenceString,
    setPreference,
} from "@/composables/usePreferences.js";
const shakaImport = import("shaka-player/dist/shaka-player.ui.js");
const hotkeysImport = import("hotkeys-js");

const route = useRoute();
const { t } = useI18n();

const props = defineProps({
    video: {
        type: Object,
        default: () => {
            return {};
        },
    },
    sponsors: {
        type: Object,
        default: () => {
            return {};
        },
    },
    selectedAutoPlay: Boolean,
    selectedAutoLoop: Boolean,
    isEmbed: Boolean,
});

const emit = defineEmits(["timeupdate", "ended", "navigateNext"]);

const container = ref(null);
const videoEl = ref(null);

const lastUpdate = ref(new Date().getTime());
const initialSeekComplete = ref(false);
const destroying = ref(false);
const inSegment = ref(false);
const showSpeedModal = ref(false);
const showCurrentSpeed = ref(false);
let hideCurrentSpeedTimeout = null;
const showCurrentVolume = ref(false);
let hideCurrentVolumeTimeout = null;
const playbackSpeedInput = ref(null);
const error = ref(0);

let shakaLib = null;
let playerInstance = null;
let uiInstance = null;
let hotkeysLib = null;
let shakaPromise = null;
let hotkeysPromise = null;
let lastSelectedTextTrack = null;
let thumbnailVttUrl = null;

const shouldAutoPlay = computed(() => {
    return getPreferenceBoolean("playerAutoPlay", true) && !props.isEmbed;
});

const preferredVideoCodecs = computed(() => {
    var preferredVideoCodecs = [];
    const enabledCodecs = getPreferenceString("enabledCodecs", "vp9,avc").split(",");

    if (videoEl.value.canPlayType('video/mp4; codecs="av01.0.08M.08"') !== "" && enabledCodecs.includes("av1"))
        preferredVideoCodecs.push("av01");
    if (videoEl.value.canPlayType('video/webm; codecs="vp9"') !== "" && enabledCodecs.includes("vp9"))
        preferredVideoCodecs.push("vp9");
    if (videoEl.value.canPlayType('video/mp4; codecs="avc1.4d401f"') !== "" && enabledCodecs.includes("avc"))
        preferredVideoCodecs.push("avc1");

    return preferredVideoCodecs;
});

function findCurrentSegment(time) {
    return props.sponsors?.segments?.find(s => time >= s.segment[0] && time < s.segment[1]);
}

function onClickSkipSegment() {
    skipSegment(videoEl.value);
}

function skipSegment(el, segment) {
    const time = el.currentTime;
    if (!segment) segment = findCurrentSegment(time);
    if (!segment) return;
    console.log("Skipped segment at " + time);
    el.currentTime = segment.segment[1];
    segment.skipped = true;
}

function adjustPlaybackSpeed(newSpeed) {
    const normalizedSpeed = Math.min(4, Math.max(0.25, newSpeed));
    playerInstance.trickPlay(normalizedSpeed);
    if (hideCurrentSpeedTimeout) window.clearTimeout(hideCurrentSpeedTimeout);
    showCurrentSpeed.value = false;
    showCurrentSpeed.value = true;
    hideCurrentSpeedTimeout = window.setTimeout(() => (showCurrentSpeed.value = false), 1500);
}

function adjustPlaybackVolume(newVolume) {
    const normalizedVolume = Math.min(1, Math.max(0, newVolume));
    videoEl.value.volume = normalizedVolume;
    if (hideCurrentVolumeTimeout) window.clearTimeout(hideCurrentVolumeTimeout);
    showCurrentVolume.value = false;
    showCurrentVolume.value = true;
    hideCurrentVolumeTimeout = window.setTimeout(() => (showCurrentVolume.value = false), 1500);
}

function setSpeedFromInput() {
    try {
        const newSpeed = Number(playbackSpeedInput.value);
        adjustPlaybackSpeed(newSpeed);
    } catch (err) {
        alert(t("actions.invalid_input"));
    }
    showSpeedModal.value = false;
}

function getActiveTextTrack() {
    return playerInstance?.getTextTracks()?.find(track => track.active) ?? null;
}

function selectTextTrack(track) {
    playerInstance.selectTextTrack(track ?? null);
    if (track) {
        lastSelectedTextTrack = track;
    }
}

function applyPreferredTextTrack() {
    const textTracks = playerInstance.getTextTracks();
    const prefSubtitles = getPreferenceString("subtitles", "");
    const autoDisplayCaptions = getPreferenceBoolean("autoDisplayCaptions", false);

    let selectedTrack = null;

    if (prefSubtitles !== "") {
        selectedTrack = textTracks.find(textTrack => textTrack.language == prefSubtitles) ?? null;
    }

    if (!selectedTrack && autoDisplayCaptions) {
        const prefLang = getPreferenceString("hl", "en").substr(0, 2);
        selectedTrack = textTracks.find(textTrack => textTrack.language == prefLang) ?? textTracks[0] ?? null;
    }

    selectTextTrack(selectedTrack);
}

function updateMarkers() {
    const markers = container.value.querySelector(".shaka-ad-markers");
    const array = ["to right"];
    props.sponsors?.segments?.forEach(segment => {
        const start = (segment.segment[0] / props.video.duration) * 100;
        const end = (segment.segment[1] / props.video.duration) * 100;

        var color = [
            "sponsor",
            "selfpromo",
            "interaction",
            "poi_highlight",
            "intro",
            "outro",
            "preview",
            "filler",
            "music_offtopic",
        ].includes(segment.category)
            ? `var(--spon-seg-${segment.category})`
            : "var(--spon-seg-default)";

        array.push(`transparent ${start}%`);
        array.push(`${color} ${start}%`);
        array.push(`${color} ${end}%`);
        array.push(`transparent ${end}%`);
    });

    if (array.length <= 1) {
        return;
    }

    if (markers) markers.style.background = `linear-gradient(${array.join(",")})`;
}

function updateSponsors() {
    if (getPreferenceBoolean("showMarkers", true)) {
        shakaPromise.then(() => {
            updateMarkers();
        });
    }
}

function getPreviewFramePage() {
    const previewFrames = props.video.previewFrames;
    if (!previewFrames) return null;
    if (Array.isArray(previewFrames)) {
        return previewFrames.findLast(Boolean) ?? previewFrames[previewFrames.length - 1] ?? null;
    }
    return previewFrames;
}

function formatVttTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor(milliseconds % 1000);

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
        2,
        "0",
    )}.${String(ms).padStart(3, "0")}`;
}

function buildThumbnailVtt(framePage) {
    const totalCount =
        framePage.totalCount ?? framePage.urls.length * framePage.framesPerPageX * framePage.framesPerPageY;
    const framesPerPage = framePage.framesPerPageX * framePage.framesPerPageY;

    let vtt = "WEBVTT\n\n";

    for (let frameIndex = 0; frameIndex < totalCount; frameIndex++) {
        const pageIndex = Math.floor(frameIndex / framesPerPage);
        const frameIndexOnPage = frameIndex % framesPerPage;
        const xIndex = frameIndexOnPage % framePage.framesPerPageX;
        const yIndex = Math.floor(frameIndexOnPage / framePage.framesPerPageX);
        const startTime = frameIndex * framePage.durationPerFrame;
        const endTime = Math.min((frameIndex + 1) * framePage.durationPerFrame, props.video.duration * 1000);

        vtt += `${formatVttTime(startTime)} --> ${formatVttTime(endTime)}\n`;
        vtt += `${framePage.urls[pageIndex]}#xywh=${xIndex * framePage.frameWidth},${yIndex * framePage.frameHeight},${
            framePage.frameWidth
        },${framePage.frameHeight}\n\n`;
    }

    return vtt;
}

async function setupThumbnailTrack() {
    const framePage = getPreviewFramePage();
    if (!framePage?.urls?.length) return;

    if (thumbnailVttUrl) {
        URL.revokeObjectURL(thumbnailVttUrl);
        thumbnailVttUrl = null;
    }

    thumbnailVttUrl = URL.createObjectURL(new Blob([buildThumbnailVtt(framePage)], { type: "text/vtt" }));
    await playerInstance.addThumbnailsTrack(thumbnailVttUrl, "text/vtt");
}

async function updateProgressDatabase(time) {
    if (new Date().getTime() - lastUpdate.value < 500) return;
    lastUpdate.value = new Date().getTime();

    if (!initialSeekComplete.value || !props.video.id || !window.db) return;

    var tx = window.db.transaction("watch_history", "readwrite");
    var store = tx.objectStore("watch_history");
    var request = store.get(props.video.id);
    request.onsuccess = function (event) {
        var video = event.target.result;
        if (video) {
            video.currentTime = time;
            store.put(video);
        }
    };
}

function seek(time) {
    if (videoEl.value) {
        videoEl.value.currentTime = time;
    }
}

async function setPlayerAttrs(localPlayer, el, uri, mime, shaka) {
    const url = "/watch?v=" + props.video.id;

    if (!uiInstance) {
        destroy();
        const OpenButton = class extends shaka.ui.Element {
            constructor(parent, controls) {
                super(parent, controls);

                this.newTabButton_ = document.createElement("button");
                this.newTabButton_.classList.add("shaka-cast-button");
                this.newTabButton_.classList.add("shaka-tooltip");
                this.newTabButton_.ariaPressed = "false";

                this.newTabIcon_ = document.createElement("i");
                this.newTabIcon_.classList.add("material-icons-round");
                this.newTabIcon_.textContent = "launch";
                this.newTabButton_.appendChild(this.newTabIcon_);

                const label = document.createElement("label");
                label.classList.add("shaka-overflow-button-label");
                label.classList.add("shaka-overflow-menu-only");
                this.newTabNameSpan_ = document.createElement("span");
                this.newTabNameSpan_.innerText = "Open in new tab";
                label.appendChild(this.newTabNameSpan_);

                this.newTabButton_.appendChild(label);
                this.parent.appendChild(this.newTabButton_);

                this.eventManager.listen(this.newTabButton_, "click", () => {
                    this.video.pause();
                    window.open(url);
                });
            }
        };

        OpenButton.Factory = class {
            create(rootElement, controls) {
                return new OpenButton(rootElement, controls);
            }
        };

        shaka.ui.OverflowMenu.registerElement("open_new_tab", new OpenButton.Factory());

        uiInstance = new shaka.ui.Overlay(localPlayer, container.value, el);

        const overflowMenuButtons = ["quality", "captions", "picture_in_picture", "playback_rate", "remote"];

        if (props.isEmbed) {
            overflowMenuButtons.push("open_new_tab");
        }

        const config = {
            overflowMenuButtons: overflowMenuButtons,
            seekBarColors: {
                base: "var(--player-base)",
                buffered: "var(--player-buffered)",
                played: "var(--player-played)",
            },
        };

        uiInstance.configure(config);
    }

    updateMarkers();

    const event = new Event("playerInit");
    window.dispatchEvent(event);

    playerInstance = localPlayer;

    const disableVideo = getPreferenceBoolean("listen", false) && !props.video.livestream;

    const prefetchLimit = Math.min(Math.max(getPreferenceNumber("prefetchLimit", 2), 0), 10);

    playerInstance.configure({
        preferredVideoCodecs: preferredVideoCodecs.value,
        preferredAudioCodecs: ["opus", "mp4a"],
        manifest: {
            disableVideo: disableVideo,
        },
        streaming: {
            segmentPrefetchLimit: prefetchLimit,
            retryParameters: {
                maxAttempts: Infinity,
                baseDelay: 250,
                backoffFactor: 1.5,
            },
        },
    });

    const quality = getPreferenceNumber("quality", 0);
    const qualityConds =
        quality > 0 && (props.video.audioStreams.length > 0 || props.video.livestream) && !disableVideo;
    if (qualityConds) playerInstance.configure("abr.enabled", false);

    const time = route.query.t ?? route.query.start;

    var startTime = 0;

    if (time) {
        startTime = parseTimeParam(time);
        initialSeekComplete.value = true;
    } else if (window.db && getPreferenceBoolean("watchHistory", false)) {
        await new Promise(resolve => {
            var tx = window.db.transaction("watch_history", "readonly");
            var store = tx.objectStore("watch_history");
            var request = store.get(props.video.id);
            request.onsuccess = function (event) {
                var video = event.target.result;
                const currentTime = video?.currentTime;
                if (currentTime) {
                    if (currentTime < video.duration * 0.9) {
                        startTime = currentTime;
                    }
                }
                resolve();
            };

            tx.oncomplete = () => {
                initialSeekComplete.value = true;
            };
        });
    } else {
        initialSeekComplete.value = true;
    }

    playerInstance
        .load(uri, startTime, mime)
        .then(async () => {
            let lang = "en";
            const prefLang = getPreferenceString("hl", "en").substr(0, 2);
            const audioTracks = playerInstance.getAudioTracks();
            const audioLanguages = [...new Set(audioTracks.map(t => t.language))];
            if (audioLanguages.includes(prefLang)) lang = prefLang;
            const selectedTrack = audioTracks.find(t => t.language === lang);
            if (selectedTrack) playerInstance.selectAudioTrack(selectedTrack);

            if (audioLanguages.length > 1) {
                const overflowMenuButtons = uiInstance.getConfiguration().overflowMenuButtons;
                const newOverflowMenuButtons = [
                    ...overflowMenuButtons.slice(0, 1),
                    "language",
                    ...overflowMenuButtons.slice(1),
                ];
                uiInstance.configure("overflowMenuButtons", newOverflowMenuButtons);
            }

            if (qualityConds) {
                var leastDiff = Number.MAX_VALUE;
                var bestStream = null;

                var bestAudio = 0;

                const tracks = playerInstance
                    .getVariantTracks()
                    .filter(track => track.language == lang || track.language == "und");

                if (quality >= 480)
                    tracks.forEach(track => {
                        const audioBandwidth = track.audioBandwidth;
                        if (audioBandwidth > bestAudio) bestAudio = audioBandwidth;
                    });

                tracks
                    .sort((a, b) => a.bandwidth - b.bandwidth)
                    .forEach(stream => {
                        if (stream.audioBandwidth < bestAudio) return;

                        const diff = Math.abs(quality - stream.height);
                        if (diff < leastDiff) {
                            leastDiff = diff;
                            bestStream = stream;
                        }
                    });

                playerInstance.selectVariantTrack(bestStream, true);
            }

            await Promise.all(
                props.video.subtitles.map(subtitle => {
                    return playerInstance.addTextTrackAsync(
                        subtitle.url,
                        subtitle.code,
                        "subtitles",
                        subtitle.mimeType,
                        null,
                        subtitle.name,
                    );
                }),
            );
            el.volume = getPreferenceNumber("volume", 1);
            const rate = getPreferenceNumber("rate", 1);
            el.playbackRate = rate;
            el.defaultPlaybackRate = rate;

            applyPreferredTextTrack();
            await setupThumbnailTrack();
        })
        .catch(e => {
            console.error(e);
            error.value = e.code;
        });

    if (route.query.fullscreen === "true" && !uiInstance.getControls().isFullScreenEnabled())
        uiInstance.getControls().toggleFullScreen();

    const seekbar = container.value.querySelector(".shaka-seek-bar");
    const array = ["to right"];
    for (const chapter of props.video.chapters) {
        const start = (chapter.start / props.video.duration) * 100;
        if (start === 0) {
            continue;
        }
        array.push(`transparent ${start}%`);
        array.push(`black ${start}%`);
        array.push(`black calc(${start}% + 1px)`);
        array.push(`transparent calc(${start}% + 1px)`);
    }
    seekbar.style.background = `linear-gradient(${array.join(",")})`;

    seekbar.addEventListener("mouseup", () => {
        videoEl.value.focus();
    });
}

async function loadVideo() {
    updateSponsors();

    const el = videoEl.value;

    el.setAttribute("poster", props.video.thumbnailUrl);

    const noPrevPlayer = !playerInstance;

    var streams = [];

    streams.push(...props.video.audioStreams);
    streams.push(...props.video.videoStreams);

    const MseSupport = window.MediaSource !== undefined || window.ManagedMediaSource !== undefined;

    const lbry = null;

    var uri;
    var mime;

    if (props.video.livestream) {
        uri = props.video.hls;
        mime = "application/x-mpegURL";
    } else if (
        props.video.audioStreams.length > 0 &&
        !lbry &&
        MseSupport &&
        !getPreferenceBoolean("preferHls", false)
    ) {
        if (!props.video.dash) {
            const dash = (await import("../utils/DashUtils.js")).generate_dash_file_from_formats(
                streams,
                props.video.duration,
            );

            uri = "data:application/dash+xml;charset=utf-8;base64," + btoa(dash);
        } else {
            const url = new URL(props.video.dash);
            url.searchParams.set("rewrite", false);
            uri = url.toString();
        }
        mime = "application/dash+xml";
    } else if (lbry) {
        uri = lbry.url;
        if (getPreferenceBoolean("proxyLBRY", false)) {
            const url = new URL(uri);
            const proxyURL = new URL(props.video.proxyUrl);
            let proxyPath = proxyURL.pathname;
            if (proxyPath.lastIndexOf("/") === proxyPath.length - 1) {
                proxyPath = proxyPath.substring(0, proxyPath.length - 1);
            }

            url.searchParams.set("host", url.host);
            url.protocol = proxyURL.protocol;
            url.host = proxyURL.host;
            url.pathname = proxyPath + url.pathname;
            uri = url.toString();
        }
        const contentType = await fetch(uri, {
            method: "HEAD",
        }).then(response => {
            uri = response.url;
            return response.headers.get("Content-Type");
        });
        mime = contentType;
    } else if (props.video.dash && !getPreferenceBoolean("preferHls", false)) {
        uri = props.video.dash;
        mime = "application/dash+xml";
    } else if (props.video.hls) {
        uri = props.video.hls;
        mime = "application/x-mpegURL";
    } else {
        uri = props.video.videoStreams.findLast(stream => stream.codec == null).url;
        mime = "video/mp4";
    }

    if (noPrevPlayer)
        shakaPromise.then(async () => {
            if (destroying.value) return;
            shakaLib.polyfill.installAll();

            const localPlayer = new shakaLib.Player();
            await localPlayer.attach(el);
            const proxyURL = new URL(props.video.proxyUrl);
            let proxyPath = proxyURL.pathname;
            if (proxyPath.lastIndexOf("/") === proxyPath.length - 1) {
                proxyPath = proxyPath.substring(0, proxyPath.length - 1);
            }

            localPlayer.getNetworkingEngine().registerRequestFilter((_type, request) => {
                const uri = request.uris[0];
                var url = new URL(uri);
                const headers = request.headers;
                if (
                    url.host.endsWith(".googlevideo.com") ||
                    (url.host.endsWith(".lbryplayer.xyz") &&
                        (getPreferenceBoolean("proxyLBRY", false) || headers.Range))
                ) {
                    url.searchParams.set("host", url.host);
                    url.protocol = proxyURL.protocol;
                    url.host = proxyURL.host;
                    url.pathname = proxyPath + url.pathname;
                    request.uris[0] = url.toString();
                }
                if (url.pathname === proxyPath + "/videoplayback") {
                    if (headers.Range) {
                        url.searchParams.set("range", headers.Range.split("=")[1]);
                        request.headers = {};
                        request.uris[0] = url.toString();
                    }
                }
            });

            localPlayer.configure("streaming.bufferingGoal", Math.max(getPreferenceNumber("bufferGoal", 10), 10));
            localPlayer.configure("streaming.bufferBehind", 300);

            setPlayerAttrs(localPlayer, el, uri, mime, shakaLib);
        });
    else setPlayerAttrs(playerInstance, el, uri, mime, shakaLib);

    if (noPrevPlayer) {
        el.addEventListener("loadeddata", () => {
            if (document.pictureInPictureElement) el.requestPictureInPicture();
        });
        el.addEventListener("timeupdate", () => {
            const time = el.currentTime;
            emit("timeupdate", time);
            updateProgressDatabase(time);
            if (props.sponsors && props.sponsors.segments) {
                const segment = findCurrentSegment(time);
                inSegment.value = !!segment;
                if (segment?.autoskip && (!segment.skipped || props.selectedAutoLoop)) {
                    skipSegment(el, segment);
                }
            }
        });

        el.addEventListener("volumechange", () => {
            setPreference("volume", el.volume, true);
        });

        el.addEventListener("ratechange", e => {
            const rate = el.playbackRate;
            if (rate > 0 && !isNaN(el.duration) && !isNaN(el.duration - e.timeStamp / 1000))
                setPreference("rate", rate, true);
        });

        el.addEventListener("ended", () => {
            emit("ended");
        });
    }
}

function destroy(hotkeys) {
    if (thumbnailVttUrl) {
        URL.revokeObjectURL(thumbnailVttUrl);
        thumbnailVttUrl = null;
    }
    if (uiInstance && !document.pictureInPictureElement) {
        uiInstance.destroy();
        uiInstance = undefined;
        playerInstance = undefined;
    }
    if (playerInstance) {
        playerInstance.destroy();
        if (!document.pictureInPictureElement) playerInstance = undefined;
    }
    if (hotkeys) hotkeysLib?.unbind();
    container.value?.querySelectorAll("div").forEach(node => node.remove());
}

onMounted(() => {
    if (!shakaLib) shakaPromise = shakaImport.then(shaka => shaka.default).then(shaka => (shakaLib = shaka));
    if (!hotkeysLib) hotkeysPromise = hotkeysImport.then(mod => mod.default).then(hk => (hotkeysLib = hk));
});

onActivated(() => {
    destroying.value = false;
    props.sponsors?.segments?.forEach(segment => (segment.skipped = false));
    hotkeysPromise.then(() => {
        hotkeysLib(
            "f,m,j,k,l,c,space,up,down,left,right,ctrl+left,ctrl+right,home,end,0,1,2,3,4,5,6,7,8,9,shift+n,shift+s,shift+,,shift+.,alt+p,return,.,,",
            function (e, handler) {
                const el = videoEl.value;
                switch (handler.key) {
                    case "f":
                        uiInstance.getControls().toggleFullScreen();
                        e.preventDefault();
                        break;
                    case "m":
                        el.muted = !el.muted;
                        e.preventDefault();
                        break;
                    case "j":
                        el.currentTime = Math.max(el.currentTime - 15, 0);
                        e.preventDefault();
                        break;
                    case "l":
                        el.currentTime = el.currentTime + 15;
                        e.preventDefault();
                        break;
                    case "c":
                        if (getActiveTextTrack()) {
                            lastSelectedTextTrack = getActiveTextTrack();
                            playerInstance.selectTextTrack(null);
                        } else if (lastSelectedTextTrack) {
                            playerInstance.selectTextTrack(lastSelectedTextTrack);
                        } else {
                            selectTextTrack(playerInstance.getTextTracks()[0] ?? null);
                        }
                        e.preventDefault();
                        break;
                    case "k":
                    case "space":
                        if (el.paused) el.play();
                        else el.pause();
                        e.preventDefault();
                        break;
                    case "up":
                        adjustPlaybackVolume(el.volume + 0.05);
                        e.preventDefault();
                        break;
                    case "down":
                        adjustPlaybackVolume(el.volume - 0.05);
                        e.preventDefault();
                        break;
                    case "left":
                        el.currentTime = Math.max(el.currentTime - 5, 0);
                        e.preventDefault();
                        break;
                    case "right":
                        el.currentTime = el.currentTime + 5;
                        e.preventDefault();
                        break;
                    case "ctrl+left": {
                        el.currentTime = props.video.chapters.findLast(chapter => chapter.start < el.currentTime).start;
                        e.preventDefault();
                        break;
                    }
                    case "ctrl+right": {
                        el.currentTime =
                            props.video.chapters.find(chapter => chapter.start > el.currentTime)?.start || el.duration;
                        e.preventDefault();
                        break;
                    }
                    case "home":
                        el.currentTime = 0;
                        e.preventDefault();
                        break;
                    case "end":
                        el.currentTime = el.duration;
                        e.preventDefault();
                        break;
                    case "0":
                        el.currentTime = 0;
                        e.preventDefault();
                        break;
                    case "1":
                        el.currentTime = el.duration * 0.1;
                        e.preventDefault();
                        break;
                    case "2":
                        el.currentTime = el.duration * 0.2;
                        e.preventDefault();
                        break;
                    case "3":
                        el.currentTime = el.duration * 0.3;
                        e.preventDefault();
                        break;
                    case "4":
                        el.currentTime = el.duration * 0.4;
                        e.preventDefault();
                        break;
                    case "5":
                        el.currentTime = el.duration * 0.5;
                        e.preventDefault();
                        break;
                    case "6":
                        el.currentTime = el.duration * 0.6;
                        e.preventDefault();
                        break;
                    case "7":
                        el.currentTime = el.duration * 0.7;
                        e.preventDefault();
                        break;
                    case "8":
                        el.currentTime = el.duration * 0.8;
                        e.preventDefault();
                        break;
                    case "9":
                        el.currentTime = el.duration * 0.9;
                        e.preventDefault();
                        break;
                    case "shift+n":
                        emit("navigateNext");
                        e.preventDefault();
                        break;
                    case "shift+s":
                        showSpeedModal.value = true;
                        break;
                    case "shift+,":
                        adjustPlaybackSpeed(el.playbackRate - 0.25);
                        break;
                    case "shift+.":
                        adjustPlaybackSpeed(el.playbackRate + 0.25);
                        break;
                    case "alt+p":
                        document.pictureInPictureElement
                            ? document.exitPictureInPicture()
                            : el.requestPictureInPicture();
                        break;
                    case "return":
                        skipSegment(el);
                        break;
                    case ".":
                        el.currentTime += 0.04;
                        e.preventDefault();
                        break;
                    case ",":
                        el.currentTime -= 0.04;
                        e.preventDefault();
                        break;
                }
            },
        );
    });
});

onDeactivated(() => {
    destroying.value = true;
    destroy(true);
});

onUnmounted(() => {
    destroying.value = true;
    destroy(true);
});

defineExpose({
    loadVideo,
    seek,
    destroy,
    updateSponsors,
    isFullScreenEnabled: () => uiInstance?.getControls()?.isFullScreenEnabled(),
});
</script>

<style>
:root {
    --player-base: rgba(255, 255, 255, 0.3);
    --player-buffered: rgba(255, 255, 255, 0.54);
    --player-played: rgba(255, 0, 0);

    --spon-seg-sponsor: #00d400;
    --spon-seg-selfpromo: #ffff00;
    --spon-seg-interaction: #cc00ff;
    --spon-seg-poi_highlight: #ff1684;
    --spon-seg-intro: #00ffff;
    --spon-seg-outro: #0202ed;
    --spon-seg-preview: #008fd6;
    --spon-seg-filler: #7300ff;
    --spon-seg-music_offtopic: #ff9900;
    --spon-seg-default: white;
}

.player-container {
    @apply max-h-75vh min-h-64 bg-black;
}

.shaka-video-container .material-icons-round {
    @apply !text-xl;
}

.shaka-video-container:-webkit-full-screen {
    max-height: none !important;
}

/* captions style */
.shaka-text-wrapper * {
    text-align: left !important;
}

.shaka-text-wrapper > span > span {
    background-color: transparent !important;
}

/* apply to all spans that don't include multiple other spans to avoid the style being applied to the text container too when the subtitles are two lines */
.shaka-text-wrapper > span > span *:first-child:last-child {
    background-color: rgba(0, 0, 0, 0.6) !important;
    padding: 0.09em 0;
}

.skip-segment-button {
    /* position button above player overlay */
    z-index: 1000;

    position: absolute;
    transform: translate(0, -50%);
    top: 50%;
    right: 0;

    background-color: rgb(0 0 0 / 0.5);
    border: 2px rgba(255, 255, 255, 0.75) solid;
    border-right: 0;
    border-radius: 0.75em;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding: 0.5em;

    /* center text vertically */
    display: flex;
    align-items: center;
    justify-content: center;

    color: #fff;
    line-height: 1.5em;
}

.skip-segment-button .skip-segment-icon {
    font-size: 1.6em !important;
    line-height: inherit !important;
    margin-left: 0.4em;
}

/* Override Tailwind preflight's `img { max-width: 100% }` which clamps
   the sprite-sheet image to the container width and breaks Shaka's
   transform-based thumbnail cropping. */
.shaka-player-ui-thumbnail-image {
    max-width: none !important;
}
</style>
