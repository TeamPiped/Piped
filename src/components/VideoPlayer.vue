<template>
    <div
        ref="container"
        data-shaka-player-container
        class="w-full max-h-screen flex justify-center"
        :class="{ 'player-container': !isEmbed }"
    >
        <video ref="videoEl" class="w-full" data-shaka-player :autoplay="shouldAutoPlay" :loop="selectedAutoLoop" />
        <canvas id="preview" />
        <button
            v-if="inSegment"
            class="skip-segment-button"
            type="button"
            :aria-label="$t('actions.skip_segment')"
            aria-pressed="false"
            @click="onClickSkipSegment"
        >
            <span v-t="'actions.skip_segment'" />
            <i class="material-icons-round">skip_next</i>
        </button>
    </div>
</template>

<script>
import "shaka-player/dist/controls.css";
import { parseTimeParam } from "@/utils/Misc";
const shaka = import("shaka-player/dist/shaka-player.ui.js");
if (!window.muxjs) {
    import("mux.js").then(muxjs => {
        window.muxjs = muxjs;
    });
}
const hotkeys = import("hotkeys-js");

export default {
    props: {
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
    },
    emits: ["timeupdate"],
    data() {
        return {
            lastUpdate: new Date().getTime(),
            initialSeekComplete: false,
            destroying: false,
            inSegment: false,
            isHoveringTimebar: false,
        };
    },
    computed: {
        shouldAutoPlay: _this => {
            return _this.getPreferenceBoolean("playerAutoPlay", true) && !_this.isEmbed;
        },
        preferredVideoCodecs: _this => {
            var preferredVideoCodecs = [];
            const enabledCodecs = _this.getPreferenceString("enabledCodecs", "vp9,avc").split(",");

            if (
                _this.$refs.videoEl.canPlayType('video/mp4; codecs="av01.0.08M.08"') !== "" &&
                enabledCodecs.includes("av1")
            )
                preferredVideoCodecs.push("av01");
            if (_this.$refs.videoEl.canPlayType('video/webm; codecs="vp9"') !== "" && enabledCodecs.includes("vp9"))
                preferredVideoCodecs.push("vp9");
            if (
                _this.$refs.videoEl.canPlayType('video/mp4; codecs="avc1.4d401f"') !== "" &&
                enabledCodecs.includes("avc")
            )
                preferredVideoCodecs.push("avc1");

            return preferredVideoCodecs;
        },
    },
    mounted() {
        if (!this.$shaka) this.shakaPromise = shaka.then(shaka => shaka.default).then(shaka => (this.$shaka = shaka));
        if (!this.$hotkeys)
            this.hotkeysPromise = hotkeys.then(mod => mod.default).then(hotkeys => (this.$hotkeys = hotkeys));
    },
    activated() {
        this.destroying = false;
        this.sponsors?.segments?.forEach(segment => (segment.skipped = false));
        this.hotkeysPromise.then(() => {
            var self = this;
            this.$hotkeys(
                "f,m,j,k,l,c,space,up,down,left,right,0,1,2,3,4,5,6,7,8,9,shift+n,shift+,,shift+.,alt+p,return,.,,",
                function (e, handler) {
                    const videoEl = self.$refs.videoEl;
                    switch (handler.key) {
                        case "f":
                            self.$ui.getControls().toggleFullScreen();
                            e.preventDefault();
                            break;
                        case "m":
                            videoEl.muted = !videoEl.muted;
                            e.preventDefault();
                            break;
                        case "j":
                            videoEl.currentTime = Math.max(videoEl.currentTime - 15, 0);
                            e.preventDefault();
                            break;
                        case "l":
                            videoEl.currentTime = videoEl.currentTime + 15;
                            e.preventDefault();
                            break;
                        case "c":
                            self.$player.setTextTrackVisibility(!self.$player.isTextTrackVisible());
                            e.preventDefault();
                            break;
                        case "k":
                        case "space":
                            if (videoEl.paused) videoEl.play();
                            else videoEl.pause();
                            e.preventDefault();
                            break;
                        case "up":
                            videoEl.volume = Math.min(videoEl.volume + 0.05, 1);
                            e.preventDefault();
                            break;
                        case "down":
                            videoEl.volume = Math.max(videoEl.volume - 0.05, 0);
                            e.preventDefault();
                            break;
                        case "left":
                            videoEl.currentTime = Math.max(videoEl.currentTime - 5, 0);
                            e.preventDefault();
                            break;
                        case "right":
                            videoEl.currentTime = videoEl.currentTime + 5;
                            e.preventDefault();
                            break;
                        case "0":
                            videoEl.currentTime = 0;
                            e.preventDefault();
                            break;
                        case "1":
                            videoEl.currentTime = videoEl.duration * 0.1;
                            e.preventDefault();
                            break;
                        case "2":
                            videoEl.currentTime = videoEl.duration * 0.2;
                            e.preventDefault();
                            break;
                        case "3":
                            videoEl.currentTime = videoEl.duration * 0.3;
                            e.preventDefault();
                            break;
                        case "4":
                            videoEl.currentTime = videoEl.duration * 0.4;
                            e.preventDefault();
                            break;
                        case "5":
                            videoEl.currentTime = videoEl.duration * 0.5;
                            e.preventDefault();
                            break;
                        case "6":
                            videoEl.currentTime = videoEl.duration * 0.6;
                            e.preventDefault();
                            break;
                        case "7":
                            videoEl.currentTime = videoEl.duration * 0.7;
                            e.preventDefault();
                            break;
                        case "8":
                            videoEl.currentTime = videoEl.duration * 0.8;
                            e.preventDefault();
                            break;
                        case "9":
                            videoEl.currentTime = videoEl.duration * 0.9;
                            e.preventDefault();
                            break;
                        case "shift+n":
                            self.navigateNext();
                            e.preventDefault();
                            break;
                        case "shift+,":
                            self.$player.trickPlay(Math.max(videoEl.playbackRate - 0.25, 0.25));
                            break;
                        case "shift+.":
                            self.$player.trickPlay(Math.min(videoEl.playbackRate + 0.25, 2));
                            break;
                        case "alt+p":
                            document.pictureInPictureElement
                                ? document.exitPictureInPicture()
                                : videoEl.requestPictureInPicture();
                            break;
                        case "return":
                            self.skipSegment(videoEl);
                            break;
                        case ".":
                            videoEl.currentTime += 0.04;
                            e.preventDefault();
                            break;
                        case ",":
                            videoEl.currentTime -= 0.04;
                            e.preventDefault();
                            break;
                    }
                },
            );
        });
    },
    deactivated() {
        this.destroying = true;
        this.destroy(true);
    },
    unmounted() {
        this.destroying = true;
        this.destroy(true);
    },
    methods: {
        async loadVideo() {
            this.updateSponsors();

            const component = this;
            const videoEl = this.$refs.videoEl;

            videoEl.setAttribute("poster", this.video.thumbnailUrl);

            const time = this.$route.query.t ?? this.$route.query.start;

            if (time) {
                videoEl.currentTime = parseTimeParam(time);
                this.initialSeekComplete = true;
            } else if (window.db && this.getPreferenceBoolean("watchHistory", false)) {
                var tx = window.db.transaction("watch_history", "readonly");
                var store = tx.objectStore("watch_history");
                var request = store.get(this.video.id);
                request.onsuccess = function (event) {
                    var video = event.target.result;
                    const currentTime = video?.currentTime;
                    if (currentTime) {
                        if (currentTime < component.video.duration * 0.9) {
                            videoEl.currentTime = currentTime;
                        }
                    }
                };

                tx.oncomplete = () => {
                    this.initialSeekComplete = true;
                };
            } else {
                this.initialSeekComplete = true;
            }

            const noPrevPlayer = !this.$player;

            var streams = [];

            streams.push(...this.video.audioStreams);
            streams.push(...this.video.videoStreams);

            const MseSupport = window.MediaSource !== undefined;

            const lbry = null;

            var uri;
            var mime;

            if (this.video.livestream) {
                uri = this.video.hls;
                mime = "application/x-mpegURL";
            } else if (this.video.audioStreams.length > 0 && !lbry && MseSupport) {
                if (!this.video.dash) {
                    const dash = (await import("../utils/DashUtils.js")).generate_dash_file_from_formats(
                        streams,
                        this.video.duration,
                    );

                    uri = "data:application/dash+xml;charset=utf-8;base64," + btoa(dash);
                } else {
                    const url = new URL(this.video.dash);
                    url.searchParams.set("rewrite", false);
                    uri = url.toString();
                }
                mime = "application/dash+xml";
            } else if (lbry) {
                uri = lbry.url;
                if (this.getPreferenceBoolean("proxyLBRY", false)) {
                    const url = new URL(uri);
                    const proxyURL = new URL(this.video.proxyUrl);
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
            } else if (this.video.hls) {
                uri = this.video.hls;
                mime = "application/x-mpegURL";
            } else {
                uri = this.video.videoStreams.findLast(stream => stream.codec == null).url;
                mime = "video/mp4";
            }

            if (noPrevPlayer)
                this.shakaPromise.then(() => {
                    if (this.destroying) return;
                    this.$shaka.polyfill.installAll();

                    const localPlayer = new this.$shaka.Player(videoEl);
                    const proxyURL = new URL(component.video.proxyUrl);
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
                                (component.getPreferenceBoolean("proxyLBRY", false) || headers.Range))
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

                    localPlayer.configure(
                        "streaming.bufferingGoal",
                        Math.max(this.getPreferenceNumber("bufferGoal", 10), 10),
                    );

                    this.setPlayerAttrs(localPlayer, videoEl, uri, mime, this.$shaka);
                });
            else this.setPlayerAttrs(this.$player, videoEl, uri, mime, this.$shaka);

            if (noPrevPlayer) {
                videoEl.addEventListener("loadeddata", () => {
                    if (document.pictureInPictureElement) videoEl.requestPictureInPicture();
                });
                videoEl.addEventListener("timeupdate", () => {
                    const time = videoEl.currentTime;
                    this.$emit("timeupdate", time);
                    this.updateProgressDatabase(time);
                    if (this.sponsors && this.sponsors.segments) {
                        const segment = this.findCurrentSegment(time);
                        this.inSegment = !!segment;
                        if (segment?.autoskip && (!segment.skipped || this.selectedAutoLoop)) {
                            this.skipSegment(videoEl, segment);
                        }
                    }
                });

                videoEl.addEventListener("volumechange", () => {
                    this.setPreference("volume", videoEl.volume, true);
                });

                videoEl.addEventListener("ratechange", e => {
                    const rate = videoEl.playbackRate;
                    if (rate > 0 && !isNaN(videoEl.duration) && !isNaN(videoEl.duration - e.timeStamp / 1000))
                        this.setPreference("rate", rate, true);
                });

                videoEl.addEventListener("ended", () => {
                    this.$emit("ended");
                });
            }

            //TODO: Add sponsors on seekbar: https://github.com/ajayyy/SponsorBlock/blob/e39de9fd852adb9196e0358ed827ad38d9933e29/src/js-components/previewBar.ts#L12
        },
        findCurrentSegment(time) {
            return this.sponsors?.segments?.find(s => time >= s.segment[0] && time < s.segment[1]);
        },
        onClickSkipSegment() {
            const videoEl = this.$refs.videoEl;
            this.skipSegment(videoEl);
        },
        skipSegment(videoEl, segment) {
            const time = videoEl.currentTime;
            if (!segment) segment = this.findCurrentSegment(time);
            if (!segment) return;
            console.log("Skipped segment at " + time);
            videoEl.currentTime = segment.segment[1];
            segment.skipped = true;
        },
        setPlayerAttrs(localPlayer, videoEl, uri, mime, shaka) {
            const url = "/watch?v=" + this.video.id;

            if (!this.$ui) {
                this.destroy();
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

                this.$ui = new shaka.ui.Overlay(localPlayer, this.$refs.container, videoEl);

                const overflowMenuButtons = [
                    "quality",
                    "language",
                    "captions",
                    "picture_in_picture",
                    "playback_rate",
                    "airplay",
                ];

                if (this.isEmbed) {
                    overflowMenuButtons.push("open_new_tab");
                }

                const config = {
                    overflowMenuButtons: overflowMenuButtons,
                    seekBarColors: {
                        base: "rgba(255, 255, 255, 0.3)",
                        buffered: "rgba(255, 255, 255, 0.54)",
                        played: "rgb(255, 0, 0)",
                    },
                };

                this.$ui.configure(config);
            }

            this.updateMarkers();

            const event = new Event("playerInit");
            window.dispatchEvent(event);

            const player = this.$ui.getControls().getPlayer();

            this.setupSeekbarPreview();

            this.$player = player;

            const disableVideo = this.getPreferenceBoolean("listen", false) && !this.video.livestream;

            this.$player.configure({
                preferredVideoCodecs: this.preferredVideoCodecs,
                preferredAudioCodecs: ["opus", "mp4a"],
                manifest: {
                    disableVideo: disableVideo,
                },
            });

            const quality = this.getPreferenceNumber("quality", 0);
            const qualityConds =
                quality > 0 && (this.video.audioStreams.length > 0 || this.video.livestream) && !disableVideo;
            if (qualityConds) this.$player.configure("abr.enabled", false);

            player.load(uri, 0, mime).then(() => {
                const isSafari = window.navigator?.vendor?.includes("Apple");

                if (!isSafari) {
                    // Set the audio language
                    const prefLang = this.getPreferenceString("hl", "en").substr(0, 2);
                    var lang = "en";
                    for (var l in player.getAudioLanguages()) {
                        if (l == prefLang) {
                            lang = l;
                            return;
                        }
                    }
                    player.selectAudioLanguage(lang);
                }

                if (qualityConds) {
                    var leastDiff = Number.MAX_VALUE;
                    var bestStream = null;

                    var bestAudio = 0;

                    const tracks = player
                        .getVariantTracks()
                        .filter(track => track.language == lang || track.language == "und");

                    // Choose the best audio stream
                    if (quality >= 480)
                        tracks.forEach(track => {
                            const audioBandwidth = track.audioBandwidth;
                            if (audioBandwidth > bestAudio) bestAudio = audioBandwidth;
                        });

                    // Find best matching stream based on resolution and bitrate
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

                    player.selectVariantTrack(bestStream);
                }

                this.video.subtitles.map(subtitle => {
                    player.addTextTrackAsync(
                        subtitle.url,
                        subtitle.code,
                        "subtitles",
                        subtitle.mimeType,
                        null,
                        subtitle.name,
                    );
                });
                videoEl.volume = this.getPreferenceNumber("volume", 1);
                const rate = this.getPreferenceNumber("rate", 1);
                videoEl.playbackRate = rate;
                videoEl.defaultPlaybackRate = rate;

                const autoDisplayCaptions = this.getPreferenceBoolean("autoDisplayCaptions", false);
                this.$player.setTextTrackVisibility(autoDisplayCaptions);
            });

            // expand the player to fullscreen when the fullscreen query equals true
            if (this.$route.query.fullscreen === "true" && !this.$ui.getControls().isFullScreenEnabled())
                this.$ui.getControls().toggleFullScreen();
        },
        async updateProgressDatabase(time) {
            // debounce
            if (new Date().getTime() - this.lastUpdate < 500) return;
            this.lastUpdate = new Date().getTime();

            if (!this.initialSeekComplete || !this.video.id || !window.db) return;

            var tx = window.db.transaction("watch_history", "readwrite");
            var store = tx.objectStore("watch_history");
            var request = store.get(this.video.id);
            request.onsuccess = function (event) {
                var video = event.target.result;
                if (video) {
                    video.currentTime = time;
                    store.put(video);
                }
            };
        },
        seek(time) {
            if (this.$refs.videoEl) {
                this.$refs.videoEl.currentTime = time;
            }
        },
        updateMarkers() {
            const markers = this.$refs.container.querySelector(".shaka-ad-markers");
            const array = ["to right"];
            this.sponsors?.segments?.forEach(segment => {
                const start = (segment.segment[0] / this.video.duration) * 100;
                const end = (segment.segment[1] / this.video.duration) * 100;

                var color;
                switch (segment.category) {
                    case "sponsor":
                        color = "#00d400";
                        break;
                    case "selfpromo":
                        color = "#ffff00";
                        break;
                    case "interaction":
                        color = "#cc00ff";
                        break;
                    case "poi_highlight":
                        color = "#ff1684";
                        break;
                    case "intro":
                        color = "#00ffff";
                        break;
                    case "outro":
                        color = "#0202ed";
                        break;
                    case "preview":
                        color = "#008fd6";
                        break;
                    case "filler":
                        color = "#7300FF";
                        break;
                    case "music_offtopic":
                        color = "#ff9900";
                        break;
                    default:
                        color = "white";
                }

                array.push(`transparent ${start}%`);
                array.push(`${color} ${start}%`);
                array.push(`${color} ${end}%`);
                array.push(`transparent ${end}%`);
            });

            if (array.length <= 1) {
                return;
            }

            if (markers) markers.style.background = `linear-gradient(${array.join(",")})`;
        },
        updateSponsors() {
            const skipOptions = this.getPreferenceJSON("skipOptions", {});
            this.sponsors?.segments?.forEach(segment => {
                const option = skipOptions[segment.category];
                segment.autoskip = option === undefined || option === "auto";
            });
            if (this.getPreferenceBoolean("showMarkers", true)) {
                this.shakaPromise.then(() => {
                    this.updateMarkers();
                });
            }
        },
        setupSeekbarPreview() {
            if (!this.video.previewFrames) return;
            let seekBar = document.querySelector(".shaka-seek-bar");
            // load the thumbnail preview when the user moves over the seekbar
            seekBar.addEventListener("mousemove", e => {
                this.isHoveringTimebar = true;
                const position = (e.offsetX / e.target.offsetWidth) * this.video.duration;
                this.showSeekbarPreview(position * 1000);
            });
            // hide the preview when the user stops hovering the seekbar
            seekBar.addEventListener("mouseout", () => {
                this.isHoveringTimebar = false;
                let canvas = document.querySelector("#preview");
                canvas.style.display = "none";
            });
        },
        async showSeekbarPreview(position) {
            const frame = this.getFrame(position);
            const originalImage = await this.loadImage(frame.url);
            if (!this.isHoveringTimebar) return;

            const seekBar = document.querySelector(".shaka-seek-bar");
            const canvas = document.querySelector("#preview");
            const ctx = canvas.getContext("2d");

            // get the new sizes for the image to be drawn into the canvas
            const originalWidth = originalImage.naturalWidth;
            const originalHeight = originalImage.naturalHeight;
            // image can have less frames than server told us so calculate them ourselves
            const imageFramesPerPageX = originalImage.naturalWidth / frame.frameWidth;
            const imageFramesPerPageY = originalImage.naturalHeight / frame.frameHeight;
            const offsetX = originalWidth * (frame.positionX / imageFramesPerPageX);
            const offsetY = originalHeight * (frame.positionY / imageFramesPerPageY);

            canvas.width = frame.frameWidth > 100 ? frame.frameWidth : frame.frameWidth * 2;
            canvas.height = frame.frameWidth > 100 ? frame.frameHeight : frame.frameHeight * 2;
            // draw the thumbnail preview into the canvas by cropping only the relevant part
            ctx.drawImage(
                originalImage,
                offsetX,
                offsetY,
                frame.frameWidth,
                frame.frameHeight,
                0,
                0,
                canvas.width,
                canvas.height,
            );

            // calculate the thumbnail preview offset and display it
            const seekbarPadding = 2; // percentage of seekbar padding
            const centerOffset = position / this.video.duration / 10;
            const left = centerOffset - ((0.5 * canvas.width) / seekBar.clientWidth) * 100;
            const maxLeft = ((seekBar.clientWidth - canvas.clientWidth) / seekBar.clientWidth) * 100 - seekbarPadding;
            canvas.style.left = `max(${seekbarPadding}%, min(${left}%, ${maxLeft}%))`;
            canvas.style.display = "block";
        },
        // ineffective algorithm to find the thumbnail corresponding to the currently hovered position in the video
        getFrame(position) {
            let startPosition = 0;
            const framePage = this.video.previewFrames.at(-1);
            for (let i = 0; i < framePage.urls.length; i++) {
                for (let positionY = 0; positionY < framePage.framesPerPageY; positionY++) {
                    for (let positionX = 0; positionX < framePage.framesPerPageX; positionX++) {
                        const endPosition = startPosition + framePage.durationPerFrame;
                        if (position >= startPosition && position <= endPosition) {
                            return {
                                url: framePage.urls[i],
                                positionX: positionX,
                                positionY: positionY,
                                frameWidth: framePage.frameWidth,
                                frameHeight: framePage.frameHeight,
                            };
                        }
                        startPosition = endPosition;
                    }
                }
            }
            return null;
        },
        // creates a new image from an URL
        loadImage(url) {
            return new Promise(r => {
                const i = new Image();
                i.onload = () => r(i);
                i.src = url;
            });
        },
        destroy(hotkeys) {
            if (this.$ui && !document.pictureInPictureElement) {
                this.$ui.destroy();
                this.$ui = undefined;
                this.$player = undefined;
            }
            if (this.$player) {
                this.$player.destroy();
                if (!document.pictureInPictureElement) this.$player = undefined;
            }
            if (hotkeys) this.$hotkeys?.unbind();
            this.$refs.container?.querySelectorAll("div").forEach(node => node.remove());
        },
    },
};
</script>

<style>
.player-container {
    @apply max-h-75vh min-h-64 bg-black;
}

.shaka-video-container .material-icons-round {
    @apply !text-xl;
}

.shaka-current-time {
    @apply !text-base;
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

.skip-segment-button .material-icons-round {
    font-size: 1.6em !important;
    line-height: inherit !important;
}

#preview {
    position: absolute;
    z-index: 2000;
    bottom: 0;
    margin-bottom: 4.5%;
    border-radius: 0.3rem;
    display: none;
}
</style>
