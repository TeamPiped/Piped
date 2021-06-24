<template>
    <div class="uk-container-expand">
        <div
            data-shaka-player-container
            style="width: 100%; height: 100%; max-height: 75vh; min-height: 250px; background: #000"
            ref="container"
        >
            <video data-shaka-player class="uk-width-expand" :autoplay="shouldAutoPlay" ref="videoEl"></video>
        </div>
    </div>
</template>

<script>
import("shaka-player/dist/controls.css");
const shaka = import("shaka-player/dist/shaka-player.ui.js");
import muxjs from "mux.js";
window.muxjs = muxjs;

export default {
    props: {
        video: Object,
        sponsors: Object,
        selectedAutoPlay: Boolean,
    },
    computed: {
        shouldAutoPlay: () => {
            const value = localStorage.getItem("playerAutoPlay");
            return value === null || value === "true";
        },
    },
    methods: {
        loadVideo() {
            const component = this;
            const videoEl = this.$refs.videoEl;

            videoEl.setAttribute("poster", this.video.thumbnailUrl);

            if (this.$route.query.t) videoEl.currentTime = this.$route.query.t;

            const noPrevPlayer = !this.player;

            var streams = [];

            streams.push(...this.video.audioStreams);
            streams.push(...this.video.videoStreams);

            var uri;

            if (this.video.livestream) {
                uri = this.video.hls;
            } else if (this.video.audioStreams.length > 0) {
                const dash = require("@/utils/DashUtils.js").default.generate_dash_file_from_formats(
                    streams,
                    this.video.duration,
                );

                uri = "data:application/dash+xml;charset=utf-8;base64," + btoa(dash);
            } else {
                uri = this.video.videoStreams[0].url;
            }

            if (noPrevPlayer)
                shaka
                    .then(shaka => shaka.default)
                    .then(shaka => {
                        this.shaka = shaka;
                        shaka.polyfill.installAll();

                        const localPlayer = new shaka.Player(videoEl);

                        localPlayer.getNetworkingEngine().registerRequestFilter((_type, request) => {
                            const uri = request.uris[0];
                            var url = new URL(uri);
                            if (url.host.endsWith(".googlevideo.com")) {
                                url.searchParams.set("host", url.host);
                                url.host = new URL(component.video.proxyUrl).host;
                                request.uris[0] = url.toString();
                            }
                        });

                        localPlayer.configure(
                            "streaming.bufferingGoal",
                            Math.max(Number(localStorage.getItem("bufferGoal")), 10),
                        );

                        this.setPlayerAttrs(localPlayer, videoEl, uri, shaka);
                    });
            else this.setPlayerAttrs(this.player, videoEl, uri, this.shaka);

            if (noPrevPlayer) {
                videoEl.addEventListener("timeupdate", () => {
                    if (this.sponsors && this.sponsors.segments) {
                        const time = videoEl.currentTime;
                        this.sponsors.segments.map(segment => {
                            if (!segment.skipped) {
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
                    if (localStorage) localStorage.setItem("volume", videoEl.volume);
                });

                videoEl.addEventListener("ended", () => {
                    if (this.selectedAutoPlay && this.video.relatedStreams.length > 0) {
                        const params = this.$route.query;
                        let url = this.video.relatedStreams[0].url;
                        const searchParams = new URLSearchParams();
                        for (var param in params)
                            switch (param) {
                                case "v":
                                case "t":
                                    break;
                                default:
                                    searchParams.set(param, params[param]);
                                    break;
                            }
                        const paramStr = searchParams.toString();
                        if (paramStr.length > 0) url += "&" + paramStr;
                        this.$router.push(url);
                    }
                });
            }

            //TODO: Add sponsors on seekbar: https://github.com/ajayyy/SponsorBlock/blob/e39de9fd852adb9196e0358ed827ad38d9933e29/src/js-components/previewBar.ts#L12
        },
        setPlayerAttrs(localPlayer, videoEl, uri, shaka) {
            if (!this.ui) {
                this.ui = new shaka.ui.Overlay(localPlayer, this.$refs.container, videoEl);

                const config = {
                    overflowMenuButtons: ["quality", "captions", "playback_rate"],
                    seekBarColors: {
                        base: "rgba(255, 255, 255, 0.3)",
                        buffered: "rgba(255, 255, 255, 0.54)",
                        played: "rgb(255, 0, 0)",
                    },
                };

                this.ui.configure(config);
            }

            const player = this.ui.getControls().getPlayer();

            this.player = player;

            const disableVideo =
                ((localStorage && localStorage.getItem("audioOnly") === "true") || this.$route.query.listen === "1") &&
                !this.video.livestream;
            this.player.configure("manifest.disableVideo", disableVideo);

            const quality = Number(localStorage.getItem("quality"));
            const qualityConds = quality > 0 && (this.video.audioStreams.length > 0 || this.video.livestream);
            if (qualityConds) this.player.configure("abr.enabled", false);

            player.load(uri, 0, uri.indexOf("dash+xml") >= 0 ? "application/dash+xml" : "video/mp4").then(() => {
                if (qualityConds) {
                    var leastDiff = Number.MAX_VALUE;
                    var bestStream = null;
                    player
                        .getVariantTracks()
                        .sort((a, b) => a.bandwidth - b.bandwidth)
                        .forEach(stream => {
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
                if (localStorage) videoEl.volume = localStorage.getItem("volume") || 1;
            });
        },
    },
    mounted() {
        import("hotkeys-js")
            .then(mod => mod.default)
            .then(hotkeys => {
                this.hotkeys = hotkeys;
                var self = this;
                hotkeys("f,m,space,up,down,left,right", function(e, handler) {
                    const videoEl = self.$refs.videoEl;
                    switch (handler.key) {
                        case "f":
                            if (document.fullscreenElement) document.exitFullscreen();
                            else self.$refs.container.requestFullscreen();
                            e.preventDefault();
                            break;
                        case "m":
                            videoEl.muted = !videoEl.muted;
                            e.preventDefault();
                            break;
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
                    }
                });
            });
    },
    beforeUnmount() {
        if (this.player) {
            this.player.destroy();
            this.player = undefined;
            this.ui = undefined;
        }
        if (this.hotkeys) this.hotkeys.unbind();
    },
};
</script>
