<template>
    <br />
    <div v-if="video && isEmbed" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 999;">
        <Player
            ref="videoPlayer"
            :video="video"
            :sponsors="sponsors"
            :selected-auto-play="false"
            :selected-auto-loop="selectedAutoLoop"
            :is-embed="isEmbed"
        />
    </div>

    <div v-if="video && !isEmbed" class="uk-container uk-container-xlarge">
        <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />

        <div v-show="!video.error" id="video-and-info">
            <Player
                ref="videoPlayer"
                :video="video"
                :sponsors="sponsors"
                :selected-auto-play="selectedAutoPlay"
                :selected-auto-loop="selectedAutoLoop"
            />
            <div class="uk-text-bold uk-margin-small-top uk-text-large uk-text-emphasis uk-text-break">
                {{ video.title }}
            </div>

            <div class="uk-flex uk-flex-middle">
                <div class="uk-margin-small-right">{{ addCommas(video.views) }} views</div>
                <div class="uk-margin-small-right">{{ uploadDate }}</div>
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
                <router-link
                    :to="toggleListenUrl"
                    :aria-label="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                    :title="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                    class="uk-margin-small-left uk-button uk-button-small"
                >
                    <font-awesome-icon icon="headphones"></font-awesome-icon>
                </router-link>
            </div>

            <div class="uk-flex uk-flex-middle uk-margin-small-top">
                <img :src="video.uploaderAvatar" alt="" loading="lazy" class="uk-border-circle" />
                <router-link v-if="video.uploaderUrl" class="uk-link uk-margin-small-left" :to="video.uploaderUrl">
                    {{ video.uploader }} </router-link
                >&thinsp;<font-awesome-icon v-if="video.uploaderVerified" icon="check"></font-awesome-icon>
                <div class="uk-flex-1"></div>
                <button
                    v-if="authenticated"
                    class="uk-button uk-button-small"
                    style="background: #222"
                    type="button"
                    @click="subscribeHandler"
                >
                    {{ subscribed ? $t("actions.unsubscribe") : $t("actions.subscribe") }}
                </button>
            </div>

            <hr />

            <a class="uk-button uk-button-small" style="background: #222" @click="showDesc = !showDesc">
                {{ showDesc ? $t("actions.minimize_description") : $t("actions.show_description") }}
            </a>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p v-show="showDesc" :style="[{ colour: foregroundColor }]" v-html="purifyHTML(video.description)"></p>
            <div v-if="showDesc && sponsors && sponsors.segments">
                {{ $t("video.sponsor_segments") }}: {{ sponsors.segments.length }}
            </div>
        </div>

        <hr />

        <label for="chkAutoLoop"
            ><b>{{ $t("actions.loop_this_video") }}:</b></label
        >&nbsp;
        <input
            id="chkAutoLoop"
            v-model="selectedAutoLoop"
            class="uk-checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
        <br />
        <label for="chkAutoPlay"
            ><b>{{ $t("actions.auto_play_next_video") }}:</b></label
        >&nbsp;
        <input
            id="chkAutoPlay"
            v-model="selectedAutoPlay"
            class="uk-checkbox"
            type="checkbox"
            @change="onChange($event)"
        />

        <hr />

        <div uk-grid>
            <div v-if="comments" ref="comments" class="uk-width-4-5@xl uk-width-3-4@s uk-width-1">
                <div id="videos-comments-container">
                    <div
                        v-for="comment in comments.comments"
                        :key="comment.commentId"
                        class="uk-tile-default uk-width-expand"
                        :style="[{ background: backgroundColor, textAlign: 'left', marginBottom: '30px' }]"
                    >
                        <Comment :comment="comment" :uploader="video.uploader" />
                    </div>
                </div>
            </div>

            <div v-if="video" class="uk-width-1-5@xl uk-width-1-4@s uk-width-1 uk-flex-last@s uk-flex-first">
                <a
                    class="uk-button uk-button-small uk-margin-small-bottom uk-hidden@s"
                    style="background: #222"
                    @click="showRecs = !showRecs"
                >
                    {{ showRecs ? $t("actions.minimize_recommendations") : $t("actions.show_recommendations") }}
                </a>
                <div
                    v-for="related in video.relatedStreams"
                    v-show="showRecs || !smallView"
                    :key="related.url"
                    class="uk-tile-default uk-width-auto"
                    :style="[{ background: backgroundColor, marginBottom: '17px' }]"
                >
                    <VideoItem :video="related" height="94" width="168" />
                </div>
                <hr class="uk-hidden@s" />
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
    components: {
        Player,
        VideoItem,
        ErrorHandler,
        Comment,
    },
    data() {
        const smallViewQuery = window.matchMedia("(max-width: 640px)");
        return {
            video: {
                title: "Loading...",
            },
            sponsors: null,
            selectedAutoLoop: false,
            selectedAutoPlay: null,
            showDesc: true,
            showRecs: true,
            comments: null,
            subscribed: false,
            channelId: null,
            active: true,
            smallViewQuery: smallViewQuery,
            smallView: smallViewQuery.matches,
        };
    },
    computed: {
        isListening(_this) {
            return _this.getPreferenceBoolean("listen", false);
        },
        toggleListenUrl(_this) {
            const url = new URL(window.location.href);
            url.searchParams.set("listen", _this.isListening ? "0" : "1");
            return url.href;
        },
        isEmbed(_this) {
            return String(_this.$route.path).indexOf("/embed/") == 0;
        },
        uploadDate(_this) {
            return new Date(_this.video.uploadDate).toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        },
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
        window.addEventListener("resize", () => {
            this.smallView = this.smallViewQuery.matches;
        });
    },
    activated() {
        this.active = true;
        this.selectedAutoPlay = this.getPreferenceBoolean("autoplay", false);
        this.showDesc = !this.getPreferenceBoolean("minimizeDescription", false);
        if (this.video.duration) {
            document.title = this.video.title + " - Piped";
            this.$refs.videoPlayer.loadVideo();
        }
        var mainElem = document.getElementsByTagName("main")[0];
        mainElem.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        this.active = false;
        var mainElem = document.getElementsByTagName("main")[0];
        mainElem.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        var mainElem = document.getElementsByTagName("main")[0];
        mainElem.removeEventListener("scroll", this.handleScroll);
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

                        this.video.description = this.video.description
                            .replaceAll("http://www.youtube.com", "")
                            .replaceAll("https://www.youtube.com", "")
                            .replaceAll("\n", "<br>");
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

            var notifText;
            if (this.subscribed) {
                notifText = this.$t("notifications.notif_subscribe");
            } else {
                notifText = this.$t("notifications.notif_unsubscribe");
            }

            this.$notify({
                text: notifText,
                type: "success",
            });
        },
        handleScroll() {
            if (this.loading || !this.comments || !this.comments.nextpage) return;
            var mainElem = document.getElementsByTagName("main")[0];
            var videosCommentsContainer = document.getElementById("videos-comments-container");
            var videoAndInfo = document.getElementById("video-and-info");
            if (
                videoAndInfo.offsetHeight + mainElem.scrollTop >=
                videosCommentsContainer.offsetHeight + videoAndInfo.offsetHeight
            ) {
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
};
</script>
