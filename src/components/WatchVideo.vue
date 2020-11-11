<template>
<h1 class="uk-text-bold">{{ video.title }}</h1>
<video controls ref="player" class="video-js vjs-16-9"></video>

<div>
    <img :src="video.uploaderAvatar" />
    <router-link class="uk-text-bold" v-bind:to="video.uploaderUrl || '/'">
        <p>{{ video.uploader }}</p>
    </router-link>
</div>

<p v-if="sponsors && sponsors.segments">Sponsors found in Video: {{ sponsors.segments.length }}</p>

<p class="uk-dark">
    <font-awesome-icon icon="thumbs-down"></font-awesome-icon>
    {{ video.likes }}
    <font-awesome-icon icon="thumbs-up"></font-awesome-icon>
    {{ video.dislikes }}
</p>
<p>
    <font-awesome-icon icon="eye"></font-awesome-icon> {{ video.views }} views
</p>
<p class="uk-light" v-html="video.description"></p>

<div class="uk-tile-default uk-text-secondary" style="background: #0b0e0f; width: 300px" v-bind:key="related.url" v-for="related in video.relatedStreams">
    <router-link class="uk-link-muted" v-bind:to="related.url">
        <p class="uk-text-emphasis">{{ related.title }}</p>
        <img style="width: 100%" v-bind:src="related.thumbnail" />
    </router-link>
    <p>
        <router-link class="uk-link-muted" v-bind:to="related.uploaderUrl || '/'">
            <p>{{ related.uploaderName }}</p>
        </router-link>
        <font-awesome-icon icon="eye"></font-awesome-icon>
        {{ related.views }} views
    </p>
</div>
</template>

<script>
import "video.js/dist/video-js.css";
import "@silvermine/videojs-quality-selector/dist/css/quality-selector.css";
import videojs from "video.js";
import "videojs-hotkeys";
import Constants from "@/Constants.js";
require("@silvermine/videojs-quality-selector")(videojs);
//import "videojs-ttml/dist/videojs-ttml.min.js";

export default {
    name: "App",
    data() {
        return {
            video: {
                title: "Loading...",
            },
            player: null,
            sponsors: null,
        };
    },
    mounted() {
        this.getVideoData();
        this.getSponsors();
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    },
    watch: {
        "$route.query.v": function (v) {
            if (v) {
                this.getVideoData();
                this.getSponsors();
            }
        },
    },
    methods: {
        async fetchVideo() {
            return await (
                await fetch(Constants.BASE_URL + "/streams/" + this.$route.query.v)
            ).json();
        },
        async fetchSponsors() {
            return await (
                await fetch(Constants.BASE_URL + "/sponsors/" + this.$route.query.v + "?category=[\"sponsor\",\"interaction\",\"selfpromo\",\"music_offtopic\"]")
            ).json();
        },
        async getVideoData() {
            this.fetchVideo()
                .then((data) => (this.video = data))
                .then(() => {
                    document.title = this.video.title + " - Piped";

                    this.video.description = this.video.description.replaceAll("http://www.youtube.com", "").replaceAll("https://www.youtube.com", "")

                    const options = {
                        autoplay: false,
                        controlBar: {
                            children: [
                                "playToggle",
                                "currentTimeDisplay",
                                "progressControl",
                                "volumePanel",
                                "qualitySelector",
                                "subtitlesButton",
                                "fullscreenToggle",
                            ],
                        },
                        plugins: {
                            ttml: {}
                        },
                        nativeTextTracks: false,
                    };

                    const noPrevPlayer = !this.player

                    if (noPrevPlayer) this.player = videojs(this.$refs.player, options);

                    this.player.hotkeys({
                        volumeStep: 0.1,
                        seekStep: 5,
                        enableModifiersForNumbers: false,
                        enableHoverScroll: true,
                    });

                    this.player.poster(this.video.thumbnailUrl);

                    var src = [];

                    this.video.videoStreams.map((stream) =>
                        src.push({
                            src: stream.url,
                            type: stream.mimeType,
                            label: stream.quality,
                        })
                    );

                    this.player.src(src);

                    if (noPrevPlayer)
                        this.player.on('timeupdate', () => {
                            if (this.sponsors && this.sponsors.segments) {
                                const time = this.player.currentTime()
                                this.sponsors.segments.map(segment => {
                                    if (!segment.skipped) {
                                        const end = segment.segment[1]
                                        if (time >= segment.segment[0] && time < end) {
                                            this.player.currentTime(end)
                                            segment.skipped = true
                                        }
                                    }
                                })
                            }
                        });

                    // if (!noPrevPlayer)
                    //     this.player.remoteTextTracks().map(track => this.player.removeRemoteTextTrack(track));

                    this.video.subtitles.map(subtitle => {
                        this.player.addRemoteTextTrack({
                            kind: "captions",
                            src: subtitle.url,
                            label: "Track",
                            type: subtitle.mimeType
                        }, false);
                    })

                    //TODO: Add sponsors on seekbar: https://github.com/ajayyy/SponsorBlock/blob/e39de9fd852adb9196e0358ed827ad38d9933e29/src/js-components/previewBar.ts#L12

                });
        },
        async getSponsors() {
            this.fetchSponsors().then((data) => (this.sponsors = data));
        },
    },
};
</script>

<style>
.vjs-current-time {
    display: block;
}
</style>
