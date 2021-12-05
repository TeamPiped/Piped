<template>
    <div v-if="video && isEmbed" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 999">
        <Player
            ref="videoPlayer"
            :video="video"
            :sponsors="sponsors"
            :selected-auto-play="false"
            :selected-auto-loop="selectedAutoLoop"
            :is-embed="isEmbed"
        />
    </div>

    <div v-if="video && !isEmbed" class="uk-container uk-container-expand">
        <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />

        <div v-show="!video.error">
            <Player
                ref="videoPlayer"
                :video="video"
                :playlist="playlist"
                :isPlaylist="isPlaylist"
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
                <template v-if="video.likes >= 0 && video.dislikes >= 0">
                    <div class="uk-margin-small-left">
                        <font-awesome-icon class="uk-margin-small-right" icon="thumbs-up"></font-awesome-icon>
                        <b>{{ addCommas(video.likes) }}</b>
                    </div>
                    <div class="uk-margin-small-left">
                        <font-awesome-icon class="uk-margin-small-right" icon="thumbs-down"></font-awesome-icon>
                        <b>{{ addCommas(video.dislikes) }}</b>
                    </div>
                </template>
                <template v-if="video.likes < 0 && video.dislikes < 0">
                    <div class="uk-margin-small-left">
                        <b v-t="'video.ratings_disabled'" />
                    </div>
                </template>
                <a :href="'https://youtu.be/' + getVideoId()" class="uk-margin-small-left uk-button uk-button-small">
                    <b>{{ $t("player.watch_on") }}&nbsp;</b>
                    <font-awesome-icon class="uk-margin-small-right" :icon="['fab', 'youtube']"></font-awesome-icon>
                </a>
                <a
                    v-if="video.lbryId"
                    :href="'https://odysee.com/' + video.lbryId"
                    class="uk-margin-small-left uk-button uk-button-small"
                >
                    <b>{{ $t("player.watch_on") }} LBRY</b>
                </a>
                <router-link
                    :to="toggleListenUrl"
                    :aria-label="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                    :title="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                    class="uk-margin-small-left uk-button uk-button-small"
                >
                    <font-awesome-icon :icon="isListening ? 'tv' : 'headphones'"></font-awesome-icon>
                </router-link>
            </div>

            <div class="uk-flex uk-flex-middle uk-margin-small-top">
                <img :src="video.uploaderAvatar" alt="" loading="lazy" class="uk-border-circle" />
                <router-link v-if="video.uploaderUrl" class="uk-link uk-margin-small-left" :to="video.uploaderUrl">
                    {{ video.uploader }} </router-link
                >&thinsp;<font-awesome-icon v-if="video.uploaderVerified" icon="check"></font-awesome-icon>
                <div class="uk-flex-1"></div>
                <button v-if="authenticated" class="uk-button uk-button-small" type="button" @click="subscribeHandler">
                    {{ subscribed ? $t("actions.unsubscribe") : $t("actions.subscribe") }}
                </button>
            </div>

            <hr />

            <a class="uk-button uk-button-small" @click="showDesc = !showDesc">
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

        <div class="uk-grid">
            <div v-if="comments" ref="comments" class="uk-width-4-5@xl uk-width-3-4@s uk-width-1">
                <div
                    v-for="comment in comments.comments"
                    :key="comment.commentId"
                    class="uk-tile-default uk-align-left uk-width-expand"
                    :style="[{ background: backgroundColor }]"
                >
                    <Comment :comment="comment" :uploader="video.uploader" :video-id="getVideoId()" />
                </div>
            </div>

            <div v-if="video" class="uk-width-1-5@xl uk-width-1-4@s uk-width-1 uk-flex-last@s uk-flex-first">
                <a class="uk-button uk-button-small uk-margin-small-bottom uk-hidden@s" @click="showRecs = !showRecs">
                    {{ showRecs ? $t("actions.minimize_recommendations") : $t("actions.show_recommendations") }}
                </a>
                <div
                    v-for="(related, index) in isPlaylist ? playlist.relatedStreams : video.relatedStreams"
                    v-show="showRecs || !smallView"
                    :key="related.url"
                    class="uk-tile-default uk-width-auto"
                    :style="[{ background: backgroundColor }]"
                >
                    <VideoItem
                        :video="related"
                        :playlist="playlist"
                        :index="index"
                        height="94"
                        width="168"
                        :isPlaylist="isPlaylist"
                    />
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
            playlist: {
                title: "Loading...",
            },
            index: null,
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
        isPlaylist(_this) {
            return !!_this.$route.query.list;
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
                const videoId = this.getVideoId();
                const instance = this;
                if (window.db && !this.video.error) {
                    var tx = window.db.transaction("watch_history", "readwrite");
                    var store = tx.objectStore("watch_history");
                    var request = store.get(videoId);
                    request.onsuccess = function(event) {
                        var video = event.target.result;
                        if (video) {
                            video.watchedAt = Date.now();
                        } else {
                            video = {
                                videoId: videoId,
                                title: instance.video.title,
                                duration: instance.video.duration,
                                thumbnail: instance.video.thumbnailUrl,
                                uploaderUrl: instance.video.uploaderUrl,
                                uploaderName: instance.video.uploader,
                                watchedAt: Date.now(),
                            };
                        }
                        store.put(video);
                    };
                }
            })();
            if (this.active) this.$refs.videoPlayer.loadVideo();
        });
        if (this.isPlaylist) {
            this.getPlaylistData();
            this.index = this.$route.query.index;
        }
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
        async fetchPlaylist() {
            return await await this.fetchJson(this.apiUrl() + "/playlists/" + this.$route.query.list);
        },
        async getPlaylistData() {
            this.fetchPlaylist()
                .then(data => (this.playlist = data))
                .then(() => (document.title = this.playlist.name + " - Piped"));
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
                    this.video.id = this.getVideoId();
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
        },
        handleScroll() {
            if (this.loading || !this.isPlaylist || !this.playlist.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.apiUrl() + "/nextpage/playlists/" + this.$route.query.list, {
                    nextpage: this.playlist.nextpage,
                }).then(json => {
                    const params = this.$route.query;
                    const searchParams = new URLSearchParams();
                    json.relatedStreams.forEach((video, i) => {
                        for (var param in params)
                            switch (param) {
                                case "v":
                                case "t":
                                    break;
                                case "index":
                                    searchParams.set(param, i + 1);
                                    break;
                                default:
                                    searchParams.set(param, params[param]);
                                    break;
                            }
                    });
                    this.playlist.relatedStreams.concat(json.relatedStreams);
                    this.playlist.nextpage = json.nextpage;
                    this.loading = false;
                    json.relatedStreams.map(stream => this.playlist.relatedStreams.push(stream));
                });
            }
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
};
</script>
