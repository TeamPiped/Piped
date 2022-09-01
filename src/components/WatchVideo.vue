<template>
    <div v-if="video && isEmbed" class="absolute top-0 left-0 h-full w-full bg-black z-50">
        <VideoPlayer
            ref="videoPlayer"
            :video="video"
            :sponsors="sponsors"
            :playlist="playlist"
            :index="index"
            :selected-auto-play="false"
            :selected-auto-loop="selectedAutoLoop"
            :is-embed="isEmbed"
        />
    </div>

    <div v-if="video && !isEmbed" class="w-full">
        <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />

        <div v-show="!video.error">
            <div :class="isMobile ? 'flex-col' : 'flex'">
                <VideoPlayer
                    ref="videoPlayer"
                    :video="video"
                    :sponsors="sponsors"
                    :playlist="playlist"
                    :index="index"
                    :selected-auto-play="selectedAutoPlay"
                    :selected-auto-loop="selectedAutoLoop"
                    @timeupdate="onTimeUpdate"
                />
                <ChaptersBar
                    :mobileLayout="isMobile"
                    v-if="video?.chapters?.length > 0"
                    :chapters="video.chapters"
                    :player-position="currentTime"
                    @seek="navigate"
                />
            </div>
            <!-- video title -->
            <div class="font-bold mt-2 text-2xl break-words" v-text="video.title" />
            <div class="flex flex-wrap mt-3 mb-3">
                <!-- views / date -->
                <div class="flex flex-auto children:ml-2">
                    <span v-t="{ path: 'video.views', args: { views: addCommas(video.views) } }" />
                    <span> | </span>
                    <span v-text="uploadDate" />
                </div>
                <!-- Likes/dilikes -->
                <div class="flex children:mr-2">
                    <template v-if="video.likes >= 0">
                        <div class="flex">
                            <div class="i-fa-solid:thumbs-up" />
                            <strong class="ml-1" v-text="addCommas(video.likes)" />
                        </div>
                        <div class="flex">
                            <div class="i-fa-solid:thumbs-down" />
                            <strong class="ml-1" v-text="video.dislikes >= 0 ? addCommas(video.dislikes) : '?'" />
                        </div>
                    </template>
                    <template v-if="video.likes < 0">
                        <div>
                            <strong v-t="'video.ratings_disabled'" />
                        </div>
                    </template>
                </div>
            </div>
            <!-- Channel info & options flex container -->
            <div class="flex">
                <!-- Channel Image & Info -->
                <div class="flex items-center">
                    <img :src="video.uploaderAvatar" alt="" loading="lazy" class="rounded-full" />
                    <router-link v-if="video.uploaderUrl" class="link ml-1.5" :to="video.uploaderUrl">{{
                        video.uploader
                    }}</router-link>
                    <!-- Verified Badge -->
                    <font-awesome-icon class="ml-1" v-if="video.uploaderVerified" icon="check" />
                </div>
                <div class="flex relative ml-auto children:mx-1">
                    <button class="btn" v-if="authenticated" @click="showModal = !showModal">
                        {{ $t("actions.add_to_playlist") }}<font-awesome-icon class="ml-1" icon="circle-plus" />
                    </button>
                    <button
                        class="btn"
                        @click="subscribeHandler"
                        v-t="{
                            path: `actions.${subscribed ? 'unsubscribe' : 'subscribe'}`,
                            args: { count: numberFormat(video.uploaderSubscriberCount) },
                        }"
                    />
                </div>
                <PlaylistAddModal v-if="showModal" :video-id="getVideoId()" @close="showModal = !showModal" />
                <ShareModal
                    v-if="showShareModal"
                    :video-id="getVideoId()"
                    :current-time="currentTime"
                    @close="showShareModal = !showShareModal"
                />
                <div class="flex">
                    <div class="self-center children:mr-1 my-1">
                        <!-- RSS Feed button -->
                        <a
                            aria-label="RSS feed"
                            title="RSS feed"
                            role="button"
                            v-if="video.uploaderUrl"
                            :href="`https://www.youtube.com/feeds/videos.xml?channel_id=${
                                video.uploaderUrl.split('/')[2]
                            }`"
                            target="_blank"
                            class="btn flex-col"
                        >
                            <font-awesome-icon icon="rss" />
                        </a>
                        <!-- watch on youtube button -->
                        <button class="btn" @click="showShareModal = !showShareModal">
                            <i18n-t class="lt-lg:hidden" keypath="actions.share" tag="strong"></i18n-t>
                            <font-awesome-icon class="mx-1.5" icon="fa-share" />
                        </button>
                        <!-- LBRY -->
                        <a v-if="video.lbryId" :href="'https://odysee.com/' + video.lbryId" class="btn">
                            <i18n-t keypath="player.watch_on" tag="strong">LBRY</i18n-t>
                        </a>
                        <!-- listen / watch toggle -->
                        <router-link
                            :to="toggleListenUrl"
                            :aria-label="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                            :title="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                            class="btn flex-col"
                        >
                            <font-awesome-icon :icon="isListening ? 'tv' : 'headphones'" />
                        </router-link>
                    </div>
                </div>
            </div>

            <hr />

            <button
                class="btn mb-2"
                @click="showDesc = !showDesc"
                v-t="`actions.${showDesc ? 'minimize_description' : 'show_description'}`"
            />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-show="showDesc" class="break-words" v-html="purifyHTML(video.description)" />
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
            <div v-if="!commentsEnabled" class="xl:col-span-4 sm:col-span-3">
                <p class="text-center mt-8" v-t="'comment.user_disabled'"></p>
            </div>
            <div v-else-if="!comments" class="xl:col-span-4 sm:col-span-3">
                <p class="text-center mt-8" v-t="'comment.loading'"></p>
            </div>
            <div v-else-if="comments.disabled" class="xl:col-span-4 sm:col-span-3">
                <p class="text-center mt-8" v-t="'comment.disabled'"></p>
            </div>
            <div v-else ref="comments" class="xl:col-span-4 sm:col-span-3">
                <CommentItem
                    v-for="comment in comments.comments"
                    :key="comment.commentId"
                    :comment="comment"
                    :uploader="video.uploader"
                    :video-id="getVideoId()"
                />
            </div>

            <div v-if="video" class="order-first sm:order-last">
                <PlaylistVideos
                    v-if="playlist"
                    :playlist-id="playlistId"
                    :playlist="playlist"
                    :selected-index="index"
                />
                <a
                    class="btn mb-2"
                    @click="showRecs = !showRecs"
                    v-t="`actions.${showRecs ? 'minimize_recommendations' : 'show_recommendations'}`"
                />
                <hr v-show="showRecs" />
                <div v-show="showRecs">
                    <VideoItem
                        v-for="related in video.relatedStreams"
                        :key="related.url"
                        :video="related"
                        height="94"
                        width="168"
                    />
                </div>
                <hr class="sm:hidden" />
            </div>
        </div>
    </div>
</template>

<script>
import VideoPlayer from "./VideoPlayer.vue";
import VideoItem from "./VideoItem.vue";
import ErrorHandler from "./ErrorHandler.vue";
import CommentItem from "./CommentItem.vue";
import ChaptersBar from "./ChaptersBar.vue";
import PlaylistAddModal from "./PlaylistAddModal.vue";
import ShareModal from "./ShareModal.vue";
import PlaylistVideos from "./PlaylistVideos.vue";

export default {
    name: "App",
    components: {
        VideoPlayer,
        VideoItem,
        ErrorHandler,
        CommentItem,
        ChaptersBar,
        PlaylistAddModal,
        ShareModal,
        PlaylistVideos,
    },
    data() {
        const smallViewQuery = window.matchMedia("(max-width: 640px)");
        return {
            video: {
                title: "Loading...",
            },
            playlistId: null,
            playlist: null,
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
            showModal: false,
            showShareModal: false,
            isMobile: true,
            currentTime: 0,
        };
    },
    computed: {
        isListening(_this) {
            return _this.getPreferenceBoolean("listen", false);
        },
        toggleListenUrl(_this) {
            const url = new URL(window.location.href);
            url.searchParams.set("listen", _this.isListening ? "0" : "1");
            return url.pathname + url.search;
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
        commentsEnabled() {
            return this.getPreferenceBoolean("comments", true);
        },
    },
    mounted() {
        // check screen size
        if (window.innerWidth >= 1024) {
            this.isMobile = false;
        }
        // add an event listener to watch for screen size changes
        window.addEventListener("resize", () => {
            if (window.innerWidth >= 1024) {
                this.isMobile = false;
            } else {
                this.isMobile = true;
            }
        });
        this.getVideoData().then(() => {
            (async () => {
                const videoId = this.getVideoId();
                const instance = this;
                if (window.db && !this.video.error) {
                    var tx = window.db.transaction("watch_history", "readwrite");
                    var store = tx.objectStore("watch_history");
                    var request = store.get(videoId);
                    request.onsuccess = function (event) {
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
        this.playlistId = this.$route.query.list;
        this.index = Number(this.$route.query.index);
        this.getPlaylistData();
        this.getSponsors();
        if (!this.isEmbed && this.commentsEnabled) this.getComments();
        window.addEventListener("resize", () => {
            this.smallView = this.smallViewQuery.matches;
        });
    },
    activated() {
        this.active = true;
        this.selectedAutoPlay = this.getPreferenceBoolean("autoplay", false);
        this.showDesc = !this.getPreferenceBoolean("minimizeDescription", false);
        this.showRecs = !this.getPreferenceBoolean("minimizeRecommendations", false);
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

                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(this.video.description, "text/html");
                        xmlDoc.querySelectorAll("a").forEach(elem => {
                            if (!elem.innerText.match(/(?:[\d]{1,2}:)?(?:[\d]{1,2}):(?:[\d]{1,2})/))
                                elem.outerHTML = elem.getAttribute("href");
                        });
                        xmlDoc.querySelectorAll("br").forEach(elem => (elem.outerHTML = "\n"));
                        this.video.description = this.urlify(xmlDoc.querySelector("body").innerHTML)
                            .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm, "$1")
                            .replaceAll(
                                /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm,
                                "/watch?v=$1",
                            )
                            .replaceAll("\n", "<br>");
                    }
                });
        },
        async getPlaylistData() {
            if (this.playlistId) {
                await this.fetchJson(this.apiUrl() + "/playlists/" + this.playlistId).then(data => {
                    this.playlist = data;
                });
                await this.fetchPlaylistPages().then(() => {
                    if (!(this.index >= 0)) {
                        for (let i = 0; i < this.playlist.relatedStreams.length; i++)
                            if (this.playlist.relatedStreams[i].url.substr(-11) == this.getVideoId()) {
                                this.index = i + 1;
                                this.$router.replace({
                                    query: { ...this.$route.query, index: this.index },
                                });
                                break;
                            }
                    }
                });
            }
        },
        async fetchPlaylistPages() {
            if (this.playlist.nextpage) {
                await this.fetchJson(this.apiUrl() + "/nextpage/playlists/" + this.playlistId, {
                    nextpage: this.playlist.nextpage,
                }).then(json => {
                    this.playlist.relatedStreams = this.playlist.relatedStreams.concat(json.relatedStreams);
                    this.playlist.nextpage = json.nextpage;
                });
                await this.fetchPlaylistPages();
            }
        },
        async getSponsors() {
            if (this.getPreferenceBoolean("sponsorblock", true))
                this.fetchSponsors().then(data => (this.sponsors = data));
        },
        async getComments() {
            this.fetchComments().then(data => (this.comments = data));
        },
        async fetchSubscribedStatus() {
            if (!this.channelId) return;
            if (!this.authenticated) {
                this.subscribed = this.isSubscribedLocally(this.channelId);
                return;
            }

            this.fetchJson(
                this.authApiUrl() + "/subscribed",
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
            if (this.authenticated) {
                this.fetchJson(this.authApiUrl() + (this.subscribed ? "/unsubscribe" : "/subscribe"), null, {
                    method: "POST",
                    body: JSON.stringify({
                        channelId: this.channelId,
                    }),
                    headers: {
                        Authorization: this.getAuthToken(),
                        "Content-Type": "application/json",
                    },
                });
            } else {
                this.handleLocalSubscriptions(this.channelId);
            }
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
        navigate(time) {
            this.$refs.videoPlayer.seek(time);
        },
        onTimeUpdate(time) {
            this.currentTime = time;
        },
    },
};
</script>
