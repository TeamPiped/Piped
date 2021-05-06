<template>
    <div class="uk-container-expand">
        <div data-shaka-player-container ref="container">
            <video data-shaka-player :autoplay="shouldAutoPlay" style="width: 100%; height: 100%" ref="videoEl"></video>
        </div>
    </div>
</template>

<script>
import("shaka-player/dist/controls.css");
const shaka = import("shaka-player/dist/shaka-player.ui.js");

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
            const videoEl = this.$refs.videoEl;

            videoEl.setAttribute("poster", this.video.thumbnailUrl);

            if (this.$route.query.t) videoEl.currentTime = this.$route.query.t;

            const noPrevPlayer = !this.player;

            var streams = [];

            streams.push(...this.video.audioStreams);
            streams.push(...this.video.videoStreams);

            const dash = require("@/utils/DashUtils.js").default.generate_dash_file_from_formats(
                streams,
                this.video.duration,
            );

            if (noPrevPlayer)
                shaka
                    .then(shaka => shaka.default)
                    .then(shaka => {
                        this.shaka = shaka;
                        shaka.polyfill.installAll();

                        const player = new shaka.Player(videoEl);

                        this.player = player;

                        this.setPlayerAttrs(player, videoEl, dash, shaka);
                    });
            else this.setPlayerAttrs(this.player, videoEl, dash, this.shaka);

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
                    if (this.selectedAutoPlay && this.video.relatedStreams.length > 0)
                        this.$router.push(this.video.relatedStreams[0].url);
                });
            }

            //TODO: Add sponsors on seekbar: https://github.com/ajayyy/SponsorBlock/blob/e39de9fd852adb9196e0358ed827ad38d9933e29/src/js-components/previewBar.ts#L12
        },
        setPlayerAttrs(player, videoEl, dash, shaka) {
            player.load("data:application/dash+xml;charset=utf-8;base64," + btoa(dash)).then(() => {
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

                const ui = this.ui || (this.ui = new shaka.ui.Overlay(player, this.$refs.container, videoEl));

                const config = {
                    overflowMenuButtons: ["quality", "captions", "playback_rate"],
                    seekBarColors: {
                        base: "rgba(255, 255, 255, 0.3)",
                        buffered: "rgba(255, 255, 255, 0.54)",
                        played: "rgb(255, 0, 0)",
                    },
                };

                ui.configure(config);
            });
        },
        onKeyPress(e) {
            if (document.activeElement.tagName === "INPUT" && document.activeElement.type === "text") return;
            const videoEl = this.$refs.videoEl;
            switch (e.code) {
                case "KeyF":
                    if (document.fullscreenElement) document.exitFullscreen();
                    else this.$refs.container.requestFullscreen();
                    e.preventDefault();
                    break;
                case "KeyM":
                    videoEl.muted = !videoEl.muted;
                    e.preventDefault();
                    break;
                case "Space":
                    if (videoEl.paused) videoEl.play();
                    else videoEl.pause();
                    e.preventDefault();
                    break;
                case "ArrowUp":
                    videoEl.volume = Math.min(videoEl.volume + 0.05, 1);
                    e.preventDefault();
                    break;
                case "ArrowDown":
                    videoEl.volume = Math.max(videoEl.volume - 0.05, 0);
                    e.preventDefault();
                    break;
                case "ArrowLeft":
                    videoEl.currentTime = Math.max(videoEl.currentTime - 5, 0);
                    e.preventDefault();
                    break;
                case "ArrowRight":
                    videoEl.currentTime = videoEl.currentTime + 5;
                    e.preventDefault();
                    break;
            }
        },
    },
    mounted() {
        document.addEventListener("keydown", this.onKeyPress);
    },
    beforeUnmount() {
        document.removeEventListener("keydown", this.onKeyPress);
        if (this.player) {
            this.player.destroy();
            this.player = undefined;
            this.ui = undefined;
        }
    },
};
</script>
