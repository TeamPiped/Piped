<template>
    <div
        ref="container"
        data-shaka-player-container
        class="w-full max-h-screen flex justify-center"
        :class="{ 'player-container': !isEmbed }"
    >
        <video ref="videoEl" class="w-full" data-shaka-player :autoplay="shouldAutoPlay" :loop="selectedAutoLoop" />
    </div>
</template>

<script>
import("shaka-player/dist/controls.css");
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
        playlist: {
            type: Object,
            default: null,
        },
        index: {
            type: Number,
            default: -1,
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
                "f,m,j,k,l,c,space,up,down,left,right,0,1,2,3,4,5,6,7,8,9,shift+n,shift+,,shift+.",
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
            const component = this;
            const videoEl = this.$refs.videoEl;

            videoEl.setAttribute("poster", this.video.thumbnailUrl);

            const time = this.$route.query.t ?? this.$route.query.start;

            if (time) {
                let start = 0;
                if (/^[\d]*$/g.test(time)) {
                    start = time;
                } else {
                    const hours = /([\d]*)h/gi.exec(time)?.[1];
                    const minutes = /([\d]*)m/gi.exec(time)?.[1];
                    const seconds = /([\d]*)s/gi.exec(time)?.[1];
                    if (hours) {
                        start += parseInt(hours) * 60 * 60;
                    }
                    if (minutes) {
                        start += parseInt(minutes) * 60;
                    }
                    if (seconds) {
                        start += parseInt(seconds);
                    }
                }
                videoEl.currentTime = start;
                this.initialSeekComplete = true;
            } else if (window.db) {
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

            const lbry = this.getPreferenceBoolean("disableLBRY", false)
                ? null
                : this.video.videoStreams.filter(stream => stream.quality === "LBRY")[0];

            var uri;
            var mime;

            if (this.video.livestream) {
                uri = this.video.hls;
                mime = "application/x-mpegURL";
            } else if (this.video.audioStreams.length > 0 && !lbry && MseSupport) {
                if (!this.video.dash) {
                    const dash = (
                        await import("@/utils/DashUtils.js").then(mod => mod.default)
                    ).generate_dash_file_from_formats(streams, this.video.duration);

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
                uri = this.video.videoStreams.filter(stream => stream.codec == null).slice(-1)[0].url;
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
                videoEl.addEventListener("timeupdate", () => {
                    const time = videoEl.currentTime;
                    this.$emit("timeupdate", time);
                    this.updateProgressDatabase(time);
                    if (this.sponsors && this.sponsors.segments) {
                        this.sponsors.segments.map(segment => {
                            if (!segment.skipped || this.selectedAutoLoop) {
                                const end = segment.segment[1];
                                if (time >= segment.segment[0] && time < end) {
                                    console.log("Skipped segment at " + time);
                                    videoEl.currentTime = end;
                                    segment.skipped = true;
                                    return;
                                }
                            }
                        });
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
                    if (
                        !this.selectedAutoLoop &&
                        this.selectedAutoPlay &&
                        (this.playlist?.relatedStreams?.length > 0 || this.video.relatedStreams.length > 0)
                    ) {
                        this.navigateNext();
                    }
                });
            }

            //TODO: Add sponsors on seekbar: https://github.com/ajayyy/SponsorBlock/blob/e39de9fd852adb9196e0358ed827ad38d9933e29/src/js-components/previewBar.ts#L12
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

            const player = this.$ui.getControls().getPlayer();

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
                        "SUBTITLE",
                        subtitle.mimeType,
                        null,
                        subtitle.name,
                    );
                });
                videoEl.volume = this.getPreferenceNumber("volume", 1);
                const rate = this.getPreferenceNumber("rate", 1);
                videoEl.playbackRate = rate;
                videoEl.defaultPlaybackRate = rate;
            });
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
        navigateNext() {
            const params = this.$route.query;
            let url = this.playlist?.relatedStreams?.[this.index]?.url ?? this.video.relatedStreams[0].url;
            const searchParams = new URLSearchParams();
            for (var param in params)
                switch (param) {
                    case "v":
                    case "t":
                        break;
                    case "index":
                        if (this.index < this.playlist.relatedStreams.length) searchParams.set("index", this.index + 1);
                        break;
                    case "list":
                        if (this.index < this.playlist.relatedStreams.length) searchParams.set("list", params.list);
                        break;
                    default:
                        searchParams.set(param, params[param]);
                        break;
                }
            const paramStr = searchParams.toString();
            if (paramStr.length > 0) url += "&" + paramStr;
            this.$router.push(url);
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
        destroy(hotkeys) {
            if (this.$ui) {
                this.$ui.destroy();
                this.$ui = undefined;
                this.$player = undefined;
            }
            if (this.$player) {
                this.$player.destroy();
                this.$player = undefined;
            }
            if (hotkeys) this.$hotkeys?.unbind();
            this.$refs.container?.querySelectorAll("div").forEach(node => node.remove());
        },
    },
    watch: {
        sponsors() {
            if (this.getPreferenceBoolean("showMarkers", true)) {
                this.shakaPromise.then(() => {
                    this.updateMarkers();
                });
            }
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
</style>
