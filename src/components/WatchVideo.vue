<template>
    <div class="uk-container uk-container-xlarge">
        <video
            controls
            ref="player"
            class="video-js preview-player-dimensions"
        ></video>
        <h1 class="uk-text-bold">{{ video.title }}</h1>

        <img :src="video.uploaderAvatar" />
        <router-link class="uk-text-bold" v-bind:to="video.uploaderUrl || '/'">
            <a>{{ video.uploader }}</a>
        </router-link>

        <p class="uk-dark">
            <font-awesome-icon icon="thumbs-down"></font-awesome-icon>
            <b>{{ video.likes }}</b>
            &nbsp;
            <font-awesome-icon icon="thumbs-up"></font-awesome-icon>
            <b>{{ video.dislikes }}</b>
        </p>
        <p>
            <font-awesome-icon icon="eye"></font-awesome-icon>
            <b>{{ video.views }}</b> views
        </p>
        <p>
            Uploaded on <b>{{ video.uploadDate }}</b>
        </p>
        <p class="uk-light" v-html="video.description"></p>
        <a v-if="sponsors && sponsors.segments"
            >Sponsors Segments: {{ sponsors.segments.length }}</a
        >

        <hr />

        <b>Auto Play next Video:</b>&nbsp;
        <input
            class="uk-checkbox"
            v-model="selectedAutoPlay"
            @change="onChange($event)"
            type="checkbox"
        />

        <div
            class="uk-tile-default uk-text-secondary"
            style="background: #0b0e0f; width: 300px"
            v-bind:key="related.url"
            v-for="related in video.relatedStreams"
        >
            <router-link class="uk-link-muted" v-bind:to="related.url">
                <p class="uk-text-emphasis">{{ related.title }}</p>
                <img style="width: 100%" v-bind:src="related.thumbnail" />
            </router-link>
            <p>
                <router-link
                    class="uk-link-muted"
                    v-bind:to="related.uploaderUrl || '/'"
                >
                    <p>{{ related.uploaderName }}</p>
                </router-link>
                <font-awesome-icon icon="eye"></font-awesome-icon>
                {{ related.views }} views
            </p>
        </div>
    </div>
</template>

<script>
import "video.js/dist/video-js.css";
import "@silvermine/videojs-quality-selector/dist/css/quality-selector.css";
import videojs from "video.js";
require("videojs-hotkeys");
import Constants from "@/Constants.js";
require("@silvermine/videojs-quality-selector")(videojs);

export default {
    name: "App",
    data() {
        return {
            video: {
                title: "Loading..."
            },
            player: null,
            audioplayer: null,
            sponsors: null
        };
    },
    mounted() {
        this.getVideoData();
        this.getSponsors();
        this.selectedAutoPlay = Constants.AUTO_PLAY;
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
        if (this.audioplayer) {
            this.audioplayer.pause();
        }
    },
    watch: {
        "$route.query.v": function(v) {
            if (v) {
                if (this.audioplayer) this.audioplayer.pause();
                this.getVideoData();
                this.getSponsors();
            }
        }
    },
    methods: {
        async fetchVideo() {
            return await (
                await fetch(
                    Constants.BASE_URL + "/streams/" + this.$route.query.v
                )
            ).json();
        },
        async fetchSponsors() {
            return await (
                await fetch(
                    Constants.BASE_URL +
                        "/sponsors/" +
                        this.$route.query.v +
                        '?category=["sponsor","interaction","selfpromo","music_offtopic"]'
                )
            ).json();
        },
        onChange() {
            if (localStorage)
                localStorage.setItem("autoplay", this.selectedAutoPlay);
        },
        async getVideoData() {
            this.fetchVideo()
                .then(data => (this.video = data))
                .then(() => {
                    document.title = this.video.title + " - Piped";

                    this.video.description = this.video.description
                        .replaceAll("http://www.youtube.com", "")
                        .replaceAll("https://www.youtube.com", "");

                    const options = {
                        autoplay: false,
                        controlBar: {
                            children: [
                                "playToggle",
                                "currentTimeDisplay",
                                "progressControl",
                                "volumePanel",
                                "qualitySelector",
                                "captionsButton",
                                "fullscreenToggle"
                            ]
                        },
                        responsive: false,
                        aspectRatio: "16:9"
                    };

                    const noPrevPlayer = !this.player;

                    if (noPrevPlayer)
                        this.player = videojs(this.$refs.player, options);

                    this.player.hotkeys({
                        volumeStep: 0.1,
                        seekStep: 5,
                        enableModifiersForNumbers: false,
                        enableHoverScroll: true
                    });

                    this.player.poster(this.video.thumbnailUrl);

                    var src = [];

                    // src.push({
                    //     src:
                    //         "data:application/dash+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPE1QRCB0eXBlPSJzdGF0aWMiIHhtbG5zPSJ1cm46bXBlZzpkYXNoOnNjaGVtYTptcGQ6MjAxMSIgbWluQnVmZmVyVGltZT0iUFQxLjVTIiBtZWRpYVByZXNlbnRhdGlvbkR1cmF0aW9uPSJQVDIyMC43NjIyMDgzMzMzMzMzMlMiIHByb2ZpbGVzPSJ1cm46bXBlZzpkYXNoOnByb2ZpbGU6aXNvZmYtbWFpbjoyMDExIj4KICA8UGVyaW9kIHN0YXJ0PSJQVDBTIj4KICAgIDxBZGFwdGF0aW9uU2V0PgogICAgICA8UmVwcmVzZW50YXRpb24gaWQ9InZpZGVvMDEiIG1pbWVUeXBlPSJ2aWRlby9tcDQiIGNvZGVjcz0iYXZjMS42NDAwMjgiIGJhbmR3aWR0aD0iMjgxNjM0Ij4KICAgICAgICAgIDxCYXNlVVJMPmh0dHBzOi8vcGlwZWRwcm94eS5rYXZpbi5yb2Nrcy92aWRlb3BsYXliYWNrP2V4cGlyZT0xNjA1NjkxNTMzJmVpPUxaUzBYLVA5RG9TLWh3YU95Sl9vRHcmaXA9MjA5LjE0MS40Ni4zOCZpZD0wN2FmZTI0MmY2ODg4ZDdjJml0YWc9MjQ4JmFpdGFncz0xMzMlMkMxMzQlMkMxMzUlMkMxMzYlMkMxMzclMkMxNjAlMkMyNDIlMkMyNDMlMkMyNDQlMkMyNDclMkMyNDglMkMyNzgmc291cmNlPXlvdXR1YmUmcmVxdWlyZXNzbD15ZXMmbWg9U0EmbW09MzElMkMyOSZtbj1zbi1uNHY3c243cyUyQ3NuLW40djdrbmxrJm1zPWF1JTJDcmR1Jm12PW0mbXZpPTUmcGw9MjMmZ2NyPXVzJmluaXRjd25kYnBzPTExMTI1MCZ2cHJ2PTEmbWltZT12aWRlbyUyRndlYm0mbnM9dllDakpkUFdQTWVjeHhrS3NlXzF4QUFGJmdpcj15ZXMmY2xlbj01MDE0MDM4NyZkdXI9MjIwLjc2MiZsbXQ9MTYwNTY0ODY5MjQyNjI0NSZtdD0xNjA1NjY5ODg1JmZ2aXA9NSZrZWVwYWxpdmU9eWVzJmM9V0VCJnR4cD01NDMyNDM0Jm49blYweDdYZXlodTV4R2ZIJnNwYXJhbXM9ZXhwaXJlJTJDZWklMkNpcCUyQ2lkJTJDYWl0YWdzJTJDc291cmNlJTJDcmVxdWlyZXNzbCUyQ2djciUyQ3ZwcnYlMkNtaW1lJTJDbnMlMkNnaXIlMkNjbGVuJTJDZHVyJTJDbG10JmxzcGFyYW1zPW1oJTJDbW0lMkNtbiUyQ21zJTJDbXYlMkNtdmklMkNwbCUyQ2luaXRjd25kYnBzJmxzaWc9QUczQ194QXdSQUlnUGh1ZklrTzBfZFBSdnFNRFhvRVZsYV9Dbzk1ZkpOYXdwbEM4QWE4eDJCd0NJRVhlOHdnTFJKeUFvZ2xNZmVPak1YTTF0d2hkcnRVWEV3eWowRVZOajFXTSZzaWc9QU9xMFFKOHdSUUloQVA5VDNQNXBCemJpZ3FoaXd2OXVlZjJDMlVoWFlmOHNfbDU2RzFla1VjV25BaUFCU0pSNFdLRlMxS05nUkhjRkUtVGJFRWFiWUtSYlA4YnItcVlzRTczVFFnPT0maG9zdD1yNS0tLXNuLW40djdzbjdzLmdvb2dsZXZpZGVvLmNvbTwvQmFzZVVSTD4KICAgICAgICA8U2VnbWVudEJhc2UgaW5kZXhSYW5nZT0iNzQwLTYyMTc0ODMxIj4KICAgICAgICAgIDxJbml0aWFsaXphdGlvbiByYW5nZT0iMC03NDAiLz4KICAgICAgICA8L1NlZ21lbnRCYXNlPgogICAgICAgIDwvUmVwcmVzZW50YXRpb24+CiAgICA8L0FkYXB0YXRpb25TZXQ+CiAgPC9QZXJpb2Q+CjwvTVBEPgo=",
                    //     type: "application/dash+xml",
                    //     label: "DASH"
                    // });

                    if (this.video.livestream) {
                        src.push({
                            src: this.video.hls,
                            type: "application/x-mpegURL"
                        });
                    } else {
                        this.video.videoStreams.map(stream =>
                            src.push({
                                src: stream.url,
                                type: stream.mimeType,
                                label: stream.quality
                            })
                        );

                        this.video.audioStreams.map(stream =>
                            src.push({
                                src: stream.url,
                                type: stream.mimeType,
                                label: stream.quality
                            })
                        );
                    }

                    if (!this.audioplayer) {
                        this.audioplayer = new Audio(
                            this.video.audioStreams.slice(-1)[0].url
                        );
                    }

                    this.player.src(src);

                    if (noPrevPlayer) {
                        this.player.on("timeupdate", () => {
                            if (this.sponsors && this.sponsors.segments) {
                                const time = this.player.currentTime();
                                this.sponsors.segments.map(segment => {
                                    if (!segment.skipped) {
                                        const end = segment.segment[1];
                                        if (
                                            time >= segment.segment[0] &&
                                            time < end
                                        ) {
                                            this.player.currentTime(end);
                                            this.audioplayer.currentTime = end;
                                            segment.skipped = true;
                                            return;
                                        }
                                    }
                                });
                            }

                            if (this.audioplayer) {
                                const delay =
                                        this.audioplayer.currentTime -
                                        this.player.currentTime(),
                                    absdelay = Math.abs(delay);

                                console.log(delay);

                                if (absdelay > 0.05) {
                                    this.audioplayer.currentTime =
                                        absdelay > 0.2
                                            ? this.player.currentTime()
                                            : this.player.currentTime() - delay;
                                }
                            }
                        });

                        this.player.on("play", () => {
                            this.audioplayer.play();
                        });

                        this.player.on("pause", () => {
                            this.audioplayer.currentTime = this.player.currentTime();
                            this.audioplayer.pause();
                        });

                        this.player.on("volumechange", () => {
                            this.audioplayer.volume = this.player.volume();
                        });

                        this.player.on("ended", () => {
                            if (
                                this.selectedAutoPlay &&
                                this.video.relatedStreams.length > 0
                            )
                                this.$router.push(
                                    this.video.relatedStreams[0].url
                                );
                        });
                    }

                    if (!noPrevPlayer)
                        this.player
                            .remoteTextTracks()
                            .map(track =>
                                this.player.removeRemoteTextTrack(track)
                            );

                    this.video.subtitles.map(subtitle => {
                        this.player.addRemoteTextTrack(
                            {
                                kind: "captions",
                                src: subtitle.url.replace(
                                    "fmt=ttml",
                                    "fmt=vtt"
                                ),
                                label: "Track",
                                type: "captions/captions.vtt"
                            },
                            false
                        ).mode = "showing";
                    });

                    //const parent = this.player.el().querySelector(".vjs-progress-holder")
                    //TODO: Add sponsors on seekbar: https://github.com/ajayyy/SponsorBlock/blob/e39de9fd852adb9196e0358ed827ad38d9933e29/src/js-components/previewBar.ts#L12
                });
        },
        async getSponsors() {
            this.fetchSponsors().then(data => (this.sponsors = data));
        }
    }
};
</script>

<style>
.vjs-current-time {
    display: block;
}
</style>
