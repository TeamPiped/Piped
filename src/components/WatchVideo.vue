<template>
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 999" v-if="video && isEmbed">
        <Player
            ref="videoPlayer"
            :video="video"
            :sponsors="sponsors"
            :selectedAutoPlay="false"
            :selectedAutoLoop="selectedAutoLoop"
            :isEmbed="isEmbed"
        />
    </div>

    <div class="uk-container uk-container-xlarge" v-if="video && !isEmbed">
        <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />

        <div v-show="!video.error">
            <Player
                ref="videoPlayer"
                :video="video"
                :sponsors="sponsors"
                :selectedAutoPlay="selectedAutoPlay"
                :selectedAutoLoop="selectedAutoLoop"
            />
            <div class="uk-text-bold uk-margin-small-top uk-text-large uk-text-emphasis uk-text-break">
                {{ video.title }}
            </div>

            <div class="uk-flex uk-flex-middle">
                <div class="uk-margin-small-right">{{ addCommas(video.views) }} views</div>
                <div class="uk-margin-small-right">{{ video.uploadDate }}</div>
                <div class="uk-flex-1"></div>
                <div class="uk-margin-small-left">
                    <font-awesome-icon class="uk-margin-small-right" icon="thumbs-up"></font-awesome-icon>
                    <b>{{ addCommas(video.likes) }}</b>
                </div>
                <div class="uk-margin-small-left">
                    <font-awesome-icon class="uk-margin-small-right" icon="thumbs-down"></font-awesome-icon>
                    <b>{{ addCommas(video.dislikes) }}</b>
                </div>
                <a
                    :href="'https://youtu.be/' + getVideoId()"
                    class="uk-margin-small-left uk-button uk-button-small"
                    style="background: #222"
                >
                    <b>{{ $t("player.watch_on") }}&nbsp;</b>
                    <font-awesome-icon class="uk-margin-small-right" :icon="['fab', 'youtube']"></font-awesome-icon>
                </a>
                <a
                    v-if="video.lbryId"
                    :href="'https://odysee.com/' + video.lbryId"
                    class="uk-margin-small-left uk-button uk-button-small"
                    style="background: #222"
                >
                    <b>{{ $t("player.watch_on") }} LBRY</b>
                </a>
            </div>

            <div class="uk-flex uk-flex-middle uk-margin-small-top">
                <img :src="video.uploaderAvatar" loading="lazy" class="uk-border-circle" />
                <router-link class="uk-link uk-margin-small-left" v-if="video.uploaderUrl" :to="video.uploaderUrl">
                    {{ video.uploader }} </router-link
                >&thinsp;<font-awesome-icon v-if="video.uploaderVerified" icon="check"></font-awesome-icon>
                <div class="uk-flex-1"></div>
                <button
                    v-if="authenticated"
                    @click="subscribeHandler"
                    class="uk-button uk-button-small"
                    style="background: #222"
                    type="button"
                >
                    {{ subscribed ? $t("actions.unsubscribe") : $t("actions.subscribe") }}
                </button>
            </div>

            <hr />

            <a class="uk-button uk-button-small" style="background: #222" @click="showDesc = !showDesc">
                {{ showDesc ? $t("actions.minimize_description") : $t("actions.show_description") }}
            </a>
            <p v-show="showDesc" :style="[{ colour: foregroundColor }]" v-html="video.description"></p>
            <div v-if="showDesc && sponsors && sponsors.segments">
                {{ $t("video.sponsor_segments") }}: {{ sponsors.segments.length }}
            </div>
        </div>

        <hr />

        <label for="chkAutoLoop"><b>{{ $t("actions.loop_this_video") }}:</b></label>&nbsp;
        <input id="chkAutoLoop" class="uk-checkbox" v-model="selectedAutoLoop" @change="onChange($event)" type="checkbox" />
        <br />
        <label for="chkAutoPlay"><b>{{ $t("actions.auto_play_next_video") }}:</b></label>&nbsp;
        <input id="chkAutoPlay" class="uk-checkbox" v-model="selectedAutoPlay" @change="onChange($event)" type="checkbox" />

        <hr />

        <div uk-grid>
            <div class="uk-width-4-5@xl uk-width-3-4@s uk-width-1" v-if="comments" ref="comments">
                <div
                    class="uk-tile-default uk-align-left uk-width-expand"
                    :style="[{ background: backgroundColor }]"
                    v-bind:key="comment.commentId"
                    v-for="comment in comments.comments"
                >
                    <Comment :comment="comment" :uploader="video.uploader" />
                </div>
            </div>

            <div class="uk-width-1-5@xl uk-width-1-4@s uk-width-1 uk-flex-last@s uk-flex-first" v-if="video">
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
import Player from "@/components/Player.vue";
import VideoItem from "@/components/VideoItem.vue";
import ErrorHandler from "@/components/ErrorHandler.vue";
import Comment from "@/components/Comment.vue";

export default {
    name: "App",
    data() {
        return {
            video: {
                title: "Loading...",
            },
            sponsors: null,
            selectedAutoLoop: false,
            selectedAutoPlay: null,
            showDesc: true,
            comments: null,
            subscribed: false,
            channelId: null,
            active: true,
        };
    },
    mounted() {
        this.getVideoData().then(() => {
            (async () => {
                if (window.db) {
                    var tx = window.db.transaction("watch_history", "readwrite");
                    var store = tx.objectStore("watch_history");
                    var video = {
                        videoId: this.getVideoId(),
                        title: this.video.title,
                        duration: this.video.duration,
                        thumbnail: this.video.thumbnailUrl,
                        uploaderUrl: this.video.uploaderUrl,
                        uploaderName: this.video.uploader,
                        watchedAt: Date.now(),
                    };
                    store.add(video);
                }
            })();
            if (this.active) this.$refs.videoPlayer.loadVideo();
        });
        this.getSponsors();
        if (!this.isEmbed && this.getPreferenceBoolean("comments", true)) this.getComments();
    },
    activated() {
        this.active = true;
        this.selectedAutoPlay = this.getPreferenceBoolean("autoplay", true);
        this.showDesc = !this.getPreferenceBoolean("minimizeDescription", false);
        if (this.video.duration) {
            document.title = this.video.title + " - Piped";
            this.$refs.videoPlayer.loadVideo();
        }
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        this.active = false;
        window.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        fetchVideo() {
            return this.fetchJson(this.apiUrl() + "/streams/" + this.getVideoId());
        },
        async fetchSponsors() {
            return await this.fetchJson(this.apiUrl() + "/sponsors/" + this.getVideoId(), {
                category:
                    '["' +
                    this.getPreferenceString("selectedSkip", "sponsor,interaction,selfpromo,music_offtopic").replaceAll(
                        ",",
                        '","',
                    ) +
                    '"]',
            });
        },
        fetchComments() {
            return this.fetchJson(this.apiUrl() + "/comments/" + this.getVideoId());
        },
        onChange() {
            this.setPreference("autoplay", this.selectedAutoPlay);
        },
        async getVideoData() {
            await this.fetchVideo()
                .then(data => {
                    this.video = data;
                })
                .then(() => {
                    if (!this.video.error) {
                        document.title = this.video.title + " - Piped";
                        this.channelId = this.video.uploaderUrl.split("/")[2];
                        if (!this.isEmbed) this.fetchSubscribedStatus();

                        this.video.description = this.purifyHTML(
                            this.video.description
                                .replaceAll("http://www.youtube.com", "")
                                .replaceAll("https://www.youtube.com", "")
                                .replaceAll("\n", "<br>"),
                        );
                    }
                });
        },
        async getSponsors() {
            if (this.getPreferenceBoolean("sponsorblock", true))
                this.fetchSponsors().then(data => (this.sponsors = data));
        },
        async getComments() {
            this.fetchComments().then(data => (this.comments = data));
        },
        async fetchSubscribedStatus() {
            if (!this.channelId || !this.authenticated) return;

            this.fetchJson(
                this.apiUrl() + "/subscribed",
                {
                    channelId: this.channelId,
                },
                {
                    headers: {
                        Authorization: this.getAuthToken(),
                    },
                },
            ).then(json => {
                this.subscribed = json.subscribed;
            });
        },
        subscribeHandler() {
            this.fetchJson(this.apiUrl() + (this.subscribed ? "/unsubscribe" : "/subscribe"), null, {
                method: "POST",
                body: JSON.stringify({
                    channelId: this.channelId,
                }),
                headers: {
                    Authorization: this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            });
            this.subscribed = !this.subscribed;
        },
        handleScroll() {
            if (this.loading || !this.comments || !this.comments.nextpage) return;
            if (window.innerHeight + window.scrollY >= this.$refs.comments.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.apiUrl() + "/nextpage/comments/" + this.getVideoId(), {
                    nextpage: this.comments.nextpage,
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
    computed: {
        isEmbed(_this) {
            return String(_this.$route.path).indexOf("/embed/") == 0;
        },
    },
    components: {
        Player,
        VideoItem,
        ErrorHandler,
        Comment,
    },
};
</script>
