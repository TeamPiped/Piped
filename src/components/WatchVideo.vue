<template>
    <div v-if="video && isEmbed" class="absolute top-0 left-0 h-full w-full z-50">
        <Player
            ref="videoPlayer"
            :video="video"
            :sponsors="sponsors"
            :selected-auto-play="false"
            :selected-auto-loop="selectedAutoLoop"
            :is-embed="isEmbed"
        />
    </div>

    <div v-if="video && !isEmbed" class="w-full">
        <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />

        <div v-show="!video.error">
            <Player
                ref="videoPlayer"
                :video="video"
                :sponsors="sponsors"
                :selected-auto-play="selectedAutoPlay"
                :selected-auto-loop="selectedAutoLoop"
            />
            <div class="font-bold mt-2 text-2xl break-words" v-text="video.title" />

            <div class="flex mb-1.5">
                <span v-text="`${addCommas(video.views)} views`" />
                <span class="ml-2" v-text="uploadDate" />

                <div class="flex items-center relative ml-auto children:ml-2">
                    <template v-if="video.likes >= 0">
                        <div>
                            <font-awesome-icon icon="thumbs-up"></font-awesome-icon>
                            <strong class="ml-2" v-text="addCommas(video.likes)" />
                        </div>
                        <div>
                            <font-awesome-icon icon="thumbs-down"></font-awesome-icon>
                            <strong class="ml-2" v-text="video.dislikes >= 0 ? addCommas(video.dislikes) : '?'" />
                        </div>
                    </template>
                    <template v-if="video.likes < 0">
                        <div>
                            <strong v-t="'video.ratings_disabled'" />
                        </div>
                    </template>
                    <a :href="`https://youtu.be/${getVideoId()}`" class="btn">
                        <strong v-text="$t('player.watch_on')" />
                        <font-awesome-icon class="ml-1.5" :icon="['fab', 'youtube']"></font-awesome-icon>
                    </a>
                    <a v-if="video.lbryId" :href="'https://odysee.com/' + video.lbryId" class="btn">
                        <strong v-text="`${$t('player.watch_on')} LBRY`" />
                    </a>
                    <router-link
                        :to="toggleListenUrl"
                        :aria-label="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                        :title="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                        class="btn"
                    >
                        <font-awesome-icon :icon="isListening ? 'tv' : 'headphones'"></font-awesome-icon>
                    </router-link>
                </div>
            </div>

            <div class="flex">
                <div class="flex items-center">
                    <img :src="video.uploaderAvatar" alt="" loading="lazy" class="rounded-full" />
                    <router-link
                        v-if="video.uploaderUrl"
                        class="link ml-1.5"
                        :to="video.uploaderUrl"
                        v-text="video.uploader"
                    /><font-awesome-icon class="ml-1" v-if="video.uploaderVerified" icon="check"></font-awesome-icon>
                </div>
                <button
                    v-if="authenticated"
                    class="btn relative ml-auto"
                    @click="subscribeHandler"
                    v-text="$t(`actions.${subscribed ? 'unsubscribe' : 'subscribe'}`)"
                />
            </div>

            <hr />

            <button
                class="btn mb-2"
                @click="showDesc = !showDesc"
                v-text="$t(`actions.${showDesc ? 'minimize_description' : 'show_description'}`)"
            />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <p v-show="showDesc" class="break-words" v-html="purifyHTML(video.description)"></p>
            <div
                v-if="showDesc && sponsors && sponsors.segments"
                v-text="`${$t('video.sponsor_segments')}: ${sponsors.segments.length}`"
            />
        </div>

        <hr />

        <label for="chkAutoLoop"><strong v-text="`${$t('actions.loop_this_video')}:`" /></label>
        <input id="chkAutoLoop" v-model="selectedAutoLoop" class="ml-1.5" type="checkbox" @change="onChange($event)" />
        <br />
        <label for="chkAutoPlay"><strong v-text="`${$t('actions.auto_play_next_video')}:`" /></label>
        <input id="chkAutoPlay" v-model="selectedAutoPlay" class="ml-1.5" type="checkbox" @change="onChange($event)" />

        <hr />

        <div class="grid xl:grid-cols-5 sm:grid-cols-4 grid-cols-1">
            <div v-if="comments" ref="comments" class="xl:col-span-4 sm:col-span-3">
                <Comment
                    v-for="comment in comments.comments"
                    :key="comment.commentId"
                    :comment="comment"
                    :uploader="video.uploader"
                    :video-id="getVideoId()"
                />
            </div>

            <div v-if="video" class="order-first sm:order-last">
                <a
                    class="btn mb-2 sm:hidden"
                    @click="showRecs = !showRecs"
                    v-text="$t(`actions.${showRecs ? 'minimize_recommendations' : 'show_recommendations'}`)"
                />
                <VideoItem
                    v-for="related in video.relatedStreams"
                    class="w-auto"
                    v-show="showRecs || !smallView"
                    :key="related.url"
                    :video="related"
                    height="94"
                    width="168"
                />
                <hr class="sm:hidden" />
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
