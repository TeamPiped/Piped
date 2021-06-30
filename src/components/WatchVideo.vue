<template>
    <div class="uk-container uk-container-xlarge" v-if="video">
        <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />

        <div v-show="!video.error">
            <Player ref="videoPlayer" :video="video" :sponsors="sponsors" :selectedAutoPlay="selectedAutoPlay" />
            <h1 class="uk-text-bold">{{ video.title }}</h1>

            <div uk-grid>
                <div class="uk-width-1-2 uk-text-left">
                    <img :src="video.uploaderAvatar" loading="lazy" />
                    <router-link class="uk-text-bold" v-if="video.uploaderUrl" :to="video.uploaderUrl">
                        <a>{{ video.uploader }}</a>
                    </router-link>

                    <div :style="[{ colour: foregroundColor }]">
                        <font-awesome-icon icon="thumbs-up"></font-awesome-icon>
                        <b>{{ addCommas(video.likes) }}</b>
                        &nbsp;
                        <font-awesome-icon icon="thumbs-down"></font-awesome-icon>
                        <b>{{ addCommas(video.dislikes) }}</b>
                    </div>
                    <div>
                        <font-awesome-icon icon="eye"></font-awesome-icon>
                        <b>{{ addCommas(video.views) }}</b> views
                    </div>
                    <div>
                        Uploaded on <b>{{ video.uploadDate }}</b>
                    </div>
                </div>

                <div class="uk-width-1-2 uk-text-right">
                    <a :href="'https://youtu.be/' + getVideoId()"
                        >Watch on <font-awesome-icon :icon="['fab', 'youtube']"></font-awesome-icon
                    ></a>
                </div>
            </div>

            <hr />

            <a class="uk-button uk-button-small" style="background: #222" @click="showDesc = !showDesc">
                {{ showDesc ? "+" : "-" }}
            </a>
            <p v-show="showDesc" :style="[{ colour: foregroundColor }]" v-html="video.description"></p>
        </div>

        <a v-if="sponsors && sponsors.segments">Sponsors Segments: {{ sponsors.segments.length }}</a>

        <hr />

        <b>Auto Play next Video:</b>&nbsp;
        <input class="uk-checkbox" v-model="selectedAutoPlay" @change="onChange($event)" type="checkbox" />

        <hr />

        <div uk-grid>
            <div class="uk-width-4-5@xl uk-width-3-4@l uk-width-2-3" v-if="comments" ref="comments">
                <div
                    class="uk-tile-default uk-align-left uk-width-expand"
                    :style="[{ background: backgroundColor }]"
                    v-bind:key="comment.commentId"
                    v-for="comment in comments.comments"
                >
                    <div align="left">
                        <div v-if="comment.pinned">
                            <font-awesome-icon icon="thumbtack"></font-awesome-icon>&nbsp; Pinned by
                            {{ video.uploader }}
                        </div>
                        <img
                            :src="comment.thumbnail"
                            style="width: 10vmin"
                            height="176"
                            width="176"
                            loading="lazy"
                            alt="avatar"
                        />
                        <br />
                        <router-link class="uk-link-muted" v-bind:to="comment.commentorUrl">
                            {{ comment.author }} </router-link
                        >&thinsp;<font-awesome-icon v-if="comment.verified" icon="check"></font-awesome-icon>
                    </div>
                    <p style="white-space: pre-wrap">{{ comment.commentText }}</p>
                    <div>
                        <b>{{ numberFormat(comment.likeCount) }}</b>
                        &nbsp;
                        <font-awesome-icon icon="thumbs-up"></font-awesome-icon>
                        &nbsp;
                        <font-awesome-icon v-if="comment.hearted" icon="heart"></font-awesome-icon>
                    </div>
                    <hr />
                </div>
            </div>

            <div class="uk-width-1-5@xl uk-width-1-4@l uk-width-1-3" v-if="video">
                <div
                    class="uk-tile-default uk-width-auto"
                    :style="[{ background: backgroundColor }]"
                    v-bind:key="related.url"
                    v-for="related in video.relatedStreams"
                >
                    <VideoItem :video="related" height="94" width="168" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";
import Player from "@/components/Player.vue";
import VideoItem from "@/components/VideoItem.vue";
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    name: "App",
    data() {
        return {
            video: {
                title: "Loading...",
            },
            sponsors: null,
            selectedAutoPlay: null,
            showDesc: true,
            comments: null,
        };
    },
    mounted() {
        this.selectedAutoPlay = Constants.AUTO_PLAY;
        this.getVideoData();
        this.getSponsors();
        this.getComments();
        window.addEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    watch: {
        "$route.query.v": function(v) {
            if (v) {
                this.getVideoData();
                this.getSponsors();
                this.getComments();
            }
        },
    },
    methods: {
        fetchVideo() {
            return this.fetchJson(Constants.BASE_URL + "/streams/" + this.getVideoId());
        },
        async fetchSponsors() {
            return await this.fetchJson(Constants.BASE_URL + "/sponsors/" + this.getVideoId(), {
                category:
                    localStorage && localStorage.getItem("selectedSkip") !== null
                        ? '["' + localStorage.getItem("selectedSkip").replace(",", '","') + '"]'
                        : '["sponsor", "interaction", "selfpromo", "music_offtopic"]',
            });
        },
        fetchComments() {
            return this.fetchJson(Constants.BASE_URL + "/comments/" + this.getVideoId());
        },
        onChange() {
            if (localStorage) localStorage.setItem("autoplay", this.selectedAutoPlay);
        },
        async getVideoData() {
            this.fetchVideo()
                .then(data => {
                    this.video = data;
                })
                .then(() => {
                    if (!this.video.error) {
                        document.title = this.video.title + " - Piped";

                        this.video.description = this.purifyHTML(
                            this.video.description
                                .replaceAll("http://www.youtube.com", "")
                                .replaceAll("https://www.youtube.com", "")
                                .replaceAll("\n", "<br>"),
                        );

                        this.$refs.videoPlayer.loadVideo();
                    }
                });
        },
        async getSponsors() {
            if (!localStorage || localStorage.getItem("sponsorblock") !== false)
                this.fetchSponsors().then(data => (this.sponsors = data));
        },
        async getComments() {
            this.fetchComments().then(data => (this.comments = data));
        },
        handleScroll() {
            if (this.loading || !this.comments || !this.comments.nextpage) return;
            if (window.innerHeight + window.scrollY >= this.$refs.comments.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(Constants.BASE_URL + "/nextpage/comments/" + this.getVideoId(), {
                    url: this.comments.nextpage,
                }).then(json => {
                    this.comments.nextpage = json.nextpage;
                    this.loading = false;
                    json.comments.map(comment => this.comments.comments.push(comment));
                });
            }
        },
        getVideoId() {
            return this.$route.query.v || this.$route.params.v;
        },
    },
    components: {
        Player,
        VideoItem,
        ErrorHandler,
    },
};
</script>
