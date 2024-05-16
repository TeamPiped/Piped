<template>
    <div v-if="video && isEmbed" class="absolute left-0 top-0 z-50 h-full w-full bg-black">
        <VideoPlayer
            ref="videoPlayer"
            :video="video"
            :sponsors="sponsors"
            :selected-auto-play="false"
            :selected-auto-loop="selectedAutoLoop"
            :is-embed="isEmbed"
        />
    </div>

    <LoadingIndicatorPage :show-content="video && !isEmbed" class="w-full">
        <ErrorHandler v-if="video && video.error" :message="video.message" :error="video.error" />
        <Transition>
            <ToastComponent v-if="shouldShowToast" @dismissed="dismiss">
                <i18n-t keypath="info.next_video_countdown">{{ counter }}</i18n-t>
            </ToastComponent>
        </Transition>

        <div v-show="!video.error">
            <div :class="isMobile ? 'flex-col' : 'flex'">
                <keep-alive>
                    <VideoPlayer
                        ref="videoPlayer"
                        :video="video"
                        :sponsors="sponsors"
                        :selected-auto-play="selectedAutoPlay"
                        :selected-auto-loop="selectedAutoLoop"
                        @timeupdate="onTimeUpdate"
                        @ended="onVideoEnded"
                        @navigate-next="navigateNext"
                    />
                </keep-alive>
                <ChaptersBar
                    v-if="video?.chapters?.length > 0 && showChapters"
                    :mobile-layout="isMobile"
                    :chapters="video.chapters"
                    :player-position="currentTime"
                    @seek="navigate"
                />
            </div>
            <!-- video title -->
            <div class="mt-2 break-words text-2xl font-bold" v-text="video.title" />
            <div class="mb-3 mt-3 flex flex-wrap">
                <!-- views / date -->
                <div class="flex flex-auto gap-2">
                    <span v-t="{ path: 'video.views', args: { views: addCommas(video.views) } }" />
                    <span> | </span>
                    <span v-text="uploadDate" />
                </div>
                <!-- Likes/dilikes -->
                <div class="flex gap-2">
                    <template v-if="video.likes >= 0">
                        <div class="flex items-center">
                            <div class="i-fa6-solid:thumbs-up" />
                            <strong class="ml-1" v-text="addCommas(video.likes)" />
                        </div>
                        <div class="flex items-center">
                            <div class="i-fa6-solid:thumbs-down" />
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
            <div class="flex flex-wrap gap-1">
                <!-- Channel Image & Info -->
                <div class="flex items-center">
                    <img
                        loading="lazy"
                        height="48"
                        width="48"
                        :src="video.uploaderAvatar"
                        alt=""
                        class="rounded-full"
                    />
                    <router-link v-if="video.uploaderUrl" class="link ml-1.5" :to="video.uploaderUrl">{{
                        video.uploader
                    }}</router-link>
                    <!-- Verified Badge -->
                    <i v-if="video.uploaderVerified" class="i-fa6-solid:check ml-1" />
                </div>
                <PlaylistAddModal
                    v-if="showModal"
                    :video-id="getVideoId()"
                    :video-info="video"
                    @close="showModal = !showModal"
                />
                <ShareModal
                    v-if="showShareModal"
                    :video-id="getVideoId()"
                    :current-time="currentTime"
                    :playlist-id="playlistId"
                    :playlist-index="index"
                    @close="showShareModal = !showShareModal"
                />
                <div class="ml-auto flex flex-wrap gap-1">
                    <!-- Subscribe Button -->
                    <button class="btn flex items-center gap-1 <md:hidden" @click="downloadCurrentFrame">
                        {{ $t("actions.download_frame") }}<i class="i-fa6-solid:download" />
                    </button>
                    <button class="btn flex items-center" @click="showModal = !showModal">
                        {{ $t("actions.add_to_playlist") }}<i class="i-fa6-solid:circle-plus ml-1" />
                    </button>
                    <button
                        class="btn"
                        @click="subscribeHandler"
                        v-text="
                            $t('actions.' + (subscribed ? 'unsubscribe' : 'subscribe')) +
                            ' - ' +
                            numberFormat(video.uploaderSubscriberCount)
                        "
                    />
                    <div class="flex flex-wrap gap-1">
                        <!-- RSS Feed button -->
                        <a
                            v-if="video.uploaderUrl"
                            aria-label="RSS feed"
                            title="RSS feed"
                            role="button"
                            :href="`${apiUrl()}/feed/unauthenticated/rss?channels=${video.uploaderUrl.split('/')[2]}`"
                            target="_blank"
                            class="btn flex items-center"
                        >
                            <i class="i-fa6-solid:rss mx-1.5" />
                        </a>
                        <!-- Share Dialog -->
                        <button class="btn flex items-center" @click="showShareModal = !showShareModal">
                            <i18n-t class="lt-lg:hidden" keypath="actions.share" tag="strong"></i18n-t>
                            <i class="i-fa6-solid:share mx-1.5" />
                        </button>
                        <!-- YouTube -->
                        <WatchOnButton :link="`https://youtu.be/${getVideoId()}`" />
                        <!-- Odysee -->
                        <WatchOnButton
                            v-if="video.lbryId"
                            :link="`https://odysee.com/${video.lbryId}`"
                            platform="Odysee"
                        />
                        <!-- listen / watch toggle -->
                        <router-link
                            :to="toggleListenUrl"
                            :aria-label="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                            :title="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                            class="btn flex items-center"
                        >
                            <i :class="isListening ? 'i-fa6-solid:tv' : 'i-fa6-solid:headphones'" class="mx-1.5" />
                        </router-link>
                    </div>
                </div>
            </div>

            <hr class="mb-2" />

            <div
                v-for="metaInfo in video?.metaInfo ?? []"
                :key="metaInfo.title"
                class="btn my-3 flex flex-wrap cursor-default gap-2 px-4 py-2"
            >
                <span>{{ metaInfo.description ?? metaInfo.title }}</span>
                <a v-for="(link, linkIndex) in metaInfo.urls" :key="linkIndex" :href="link" class="underline">{{
                    metaInfo.urlTexts[linkIndex]
                }}</a>
                <br />
            </div>

            <button
                v-t="`actions.${showDesc ? 'minimize_description' : 'show_description'}`"
                class="btn mb-2"
                @click="showDesc = !showDesc"
            />

            <span v-show="video?.chapters?.length > 0" class="btn ml-2">
                <input id="showChapters" v-model="showChapters" type="checkbox" />
                <label v-t="'actions.show_chapters'" class="ml-2" for="showChapters" />
            </span>

            <template v-if="showDesc">
                <!-- eslint-disable-next-line vue/no-v-html -->
                <div class="description break-words" v-html="purifiedDescription" />
                <br />

                <div
                    v-if="sponsors && sponsors.segments"
                    v-text="`${$t('video.sponsor_segments')}: ${sponsors.segments.length}`"
                />
                <div v-if="video.category" v-text="`${$t('video.category')}: ${video.category}`" />
                <div v-text="`${$t('video.license')}: ${video.license}`" />
                <div class="capitalize" v-text="`${$t('video.visibility')}: ${video.visibility}`" />

                <div v-if="video.tags" class="mt-2 flex flex-wrap gap-2">
                    <router-link
                        v-for="tag in video.tags"
                        :key="tag"
                        class="btn line-clamp-1 rounded-s px-2 py-1"
                        :to="`/results?search_query=${encodeURIComponent(tag)}`"
                        >{{ tag }}</router-link
                    >
                </div>
            </template>
        </div>

        <hr />

        <label for="chkAutoLoop"><strong v-text="`${$t('actions.loop_this_video')}:`" /></label>
        <input id="chkAutoLoop" v-model="selectedAutoLoop" class="ml-1.5" type="checkbox" @change="onChange($event)" />
        <br />
        <label for="chkAutoPlay"><strong v-text="`${$t('actions.auto_play_next_video')}:`" /></label>
        <input id="chkAutoPlay" v-model="selectedAutoPlay" class="ml-1.5" type="checkbox" @change="onChange($event)" />

        <hr />

        <div class="grid grid-cols-1 sm:grid-cols-4 xl:grid-cols-5">
            <div class="sm:col-span-3 xl:col-span-4">
                <button
                    v-if="!comments?.disabled"
                    class="btn mb-2"
                    @click="toggleComments"
                    v-text="
                        `${$t(showComments ? 'actions.minimize_comments' : 'actions.show_comments')} (${numberFormat(
                            comments?.commentCount,
                        )})`
                    "
                />
            </div>
            <div v-if="!showComments" class="sm:col-span-3 xl:col-span-4"></div>
            <div v-else-if="!comments" class="sm:col-span-3 xl:col-span-4">
                <p v-t="'comment.loading'" class="mt-8 text-center"></p>
            </div>
            <div v-else-if="comments.disabled" class="sm:col-span-3 xl:col-span-4">
                <p v-t="'comment.disabled'" class="mt-8 text-center"></p>
            </div>
            <div v-else ref="comments" class="sm:col-span-3 xl:col-span-4">
                <CommentItem
                    v-for="comment in comments.comments"
                    :key="comment.commentId"
                    :comment="comment"
                    :uploader="video.uploader"
                    :uploader-avatar-url="video.uploaderAvatar"
                    :video-id="getVideoId()"
                />
            </div>

            <div v-if="video" class="order-first sm:order-last">
                <PlaylistVideos
                    v-if="playlist"
                    :playlist-id="playlistId"
                    :playlist="playlist"
                    :selected-index="index"
                    :prefer-listen="isListening"
                />
                <a
                    v-t="`actions.${showRecs ? 'minimize_recommendations' : 'show_recommendations'}`"
                    class="btn mb-2"
                    @click="showRecs = !showRecs"
                />
                <hr v-show="showRecs" />
                <div v-show="showRecs">
                    <ContentItem
                        v-for="related in video.relatedStreams"
                        :key="related.url"
                        :item="related"
                        :prefer-listen="isListening"
                        class="mb-4"
                        height="94"
                        width="168"
                    />
                </div>
                <hr class="sm:hidden" />
            </div>
        </div>
    </LoadingIndicatorPage>
</template>

<script>
import VideoPlayer from "./VideoPlayer.vue";
import ContentItem from "./ContentItem.vue";
import ErrorHandler from "./ErrorHandler.vue";
import CommentItem from "./CommentItem.vue";
import ChaptersBar from "./ChaptersBar.vue";
import PlaylistAddModal from "./PlaylistAddModal.vue";
import ShareModal from "./ShareModal.vue";
import PlaylistVideos from "./PlaylistVideos.vue";
import WatchOnButton from "./WatchOnButton.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import ToastComponent from "./ToastComponent.vue";
import { parseTimeParam } from "@/utils/Misc";
import { purifyHTML, rewriteDescription } from "@/utils/HtmlUtils";

export default {
    name: "App",
    components: {
        VideoPlayer,
        ContentItem,
        ErrorHandler,
        CommentItem,
        ChaptersBar,
        PlaylistAddModal,
        ShareModal,
        PlaylistVideos,
        WatchOnButton,
        LoadingIndicatorPage,
        ToastComponent,
    },
    data() {
        const smallViewQuery = window.matchMedia("(max-width: 640px)");
        return {
            video: null,
            playlistId: null,
            playlist: null,
            index: null,
            sponsors: null,
            selectedAutoLoop: false,
            selectedAutoPlay: null,
            showComments: true,
            showDesc: false,
            showRecs: true,
            showChapters: true,
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
            shouldShowToast: false,
            timeoutCounter: null,
            counter: 0,
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
        defaultCounter(_this) {
            return _this.getPreferenceNumber("autoPlayNextCountdown", 5);
        },
        purifiedDescription() {
            return purifyHTML(this.video.description);
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
                if (window.db && this.getPreferenceBoolean("watchHistory", false) && !this.video.error) {
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
        if (!this.isEmbed && this.showComments) this.getComments();
        if (this.isEmbed) document.querySelector("html").style.overflow = "hidden";
        window.addEventListener("click", this.handleClick);
        window.addEventListener("resize", () => {
            this.smallView = this.smallViewQuery.matches;
        });
    },
    activated() {
        this.active = true;
        this.selectedAutoPlay = this.getPreferenceBoolean("autoplay", false);
        this.showComments = !this.getPreferenceBoolean("minimizeComments", false);
        this.showDesc = !this.getPreferenceBoolean("minimizeDescription", true);
        this.showRecs = !this.getPreferenceBoolean("minimizeRecommendations", false);
        this.showChapters = !this.getPreferenceBoolean("minimizeChapters", false);
        if (this.video?.duration) {
            document.title = this.video.title + " - Piped";
            this.$refs.videoPlayer.loadVideo();
        }
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        this.active = false;
        window.removeEventListener("scroll", this.handleScroll);
        this.dismiss();
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
        window.removeEventListener("click", this.handleClick);
        this.dismiss();
    },
    methods: {
        fetchVideo() {
            return this.fetchJson(this.apiUrl() + "/streams/" + this.getVideoId());
        },
        async fetchSponsors() {
            var selectedSkip = this.getPreferenceString(
                "selectedSkip",
                "sponsor,interaction,selfpromo,music_offtopic",
            ).split(",");
            const skipOptions = this.getPreferenceJSON("skipOptions");
            if (skipOptions !== undefined) {
                selectedSkip = Object.keys(skipOptions).filter(
                    k => skipOptions[k] !== undefined && skipOptions[k] !== "no",
                );
            }

            const sponsors = await this.fetchJson(this.apiUrl() + "/sponsors/" + this.getVideoId(), {
                category: JSON.stringify(selectedSkip),
            });

            sponsors?.segments?.forEach(segment => {
                const option = skipOptions?.[segment.category];
                segment.autoskip = option === undefined || option === "auto";
            });

            const minSegmentLength = Math.max(this.getPreferenceNumber("minSegmentLength", 0), 0);
            sponsors.segments = sponsors.segments?.filter(segment => {
                const length = segment.segment[1] - segment.segment[0];
                return length >= minSegmentLength;
            });

            return sponsors;
        },
        toggleComments() {
            this.showComments = !this.showComments;
            if (this.showComments && this.comments === null) {
                this.fetchComments();
            }
        },
        fetchComments() {
            return this.fetchJson(this.apiUrl() + "/comments/" + this.getVideoId());
        },
        onChange() {
            this.setPreference("autoplay", this.selectedAutoPlay, true);
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
                        this.video.description = rewriteDescription(xmlDoc.querySelector("body").innerHTML);
                        this.updateWatched(this.video.relatedStreams);

                        this.fetchDeArrowContent(this.video.relatedStreams);
                    }
                });
        },
        async getPlaylistData() {
            if (this.playlistId) {
                this.playlist = await this.getPlaylist(this.playlistId);
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
                await this.fetchPlaylistPages().then(() => {
                    this.fetchDeArrowContent(this.playlist.relatedStreams);
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
            this.comments = await this.fetchComments();
        },
        async fetchSubscribedStatus() {
            if (!this.channelId) return;

            this.subscribed = await this.fetchSubscriptionStatus(this.channelId);
        },
        subscribeHandler() {
            this.toggleSubscriptionState(this.channelId, this.subscribed).then(success => {
                if (success) this.subscribed = !this.subscribed;
            });
        },
        handleClick(event) {
            if (!event || !event.target) return;
            if (!event.target.matches("a[href]")) return;
            const target = event.target;
            if (!target.getAttribute("href")) return;
            if (this.handleTimestampLinks(target)) {
                event.preventDefault();
            }
        },
        handleTimestampLinks(target) {
            try {
                const url = new URL(target.getAttribute("href"), document.baseURI);
                if (
                    url.searchParams.size > 2 ||
                    url.searchParams.get("v") !== this.getVideoId() ||
                    !url.searchParams.has("t")
                ) {
                    return false;
                }
                const time = parseTimeParam(url.searchParams.get("t"));
                if (time) {
                    this.navigate(time);
                }
                return true;
            } catch (e) {
                console.error(e);
            }
            return false;
        },
        handleScroll() {
            if (this.loading || !this.comments || !this.comments.nextpage) return;
            if (window.innerHeight + window.scrollY >= this.$refs.comments?.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.apiUrl() + "/nextpage/comments/" + this.getVideoId(), {
                    nextpage: this.comments.nextpage,
                }).then(json => {
                    this.comments.nextpage = json.nextpage;
                    this.loading = false;
                    this.comments.comments = this.comments.comments.concat(json.comments);
                });
            }
        },
        getVideoId() {
            if (this.$route.query.video_ids) {
                const videos_list = this.$route.query.video_ids.split(",");
                this.index = Number(this.$route.query.index ?? 0);
                return videos_list[this.index];
            }

            return this.$route.query.v || this.$route.params.v;
        },
        navigate(time) {
            this.$refs.videoPlayer.seek(time);
        },
        onTimeUpdate(time) {
            this.currentTime = time;
        },
        onVideoEnded() {
            if (
                !this.selectedAutoLoop &&
                this.selectedAutoPlay &&
                (this.playlist?.relatedStreams?.length > 0 || this.video.relatedStreams.length > 0)
            ) {
                this.showToast();
            }
        },
        showToast() {
            this.counter = this.defaultCounter;
            if (this.counter < 1) {
                this.navigateNext();
                return;
            }
            if (this.timeoutCounter) clearInterval(this.timeoutCounter);
            this.timeoutCounter = setInterval(() => {
                this.counter--;
                if (this.counter === 0) {
                    this.dismiss();
                    this.navigateNext();
                }
            }, 1000);
            this.shouldShowToast = true;
        },
        dismiss() {
            clearInterval(this.timeoutCounter);
            this.shouldShowToast = false;
        },
        navigateNext() {
            const params = this.$route.query;
            const video_ids = this.$route.query.video_ids?.split(",") ?? [];
            let url;
            if (this.playlist) {
                url = this.playlist?.relatedStreams?.[this.index]?.url ?? this.video.relatedStreams[0].url;
            } else if (video_ids.length > this.index + 1) {
                url = `${this.$route.path}?index=${this.index + 1}`;
            } else {
                url = this.video.relatedStreams[0].url;
            }
            const searchParams = new URLSearchParams();
            for (var param in params)
                switch (param) {
                    case "v":
                    case "t":
                        break;
                    case "index":
                        if (this.playlist && this.index < this.playlist.relatedStreams.length)
                            searchParams.set("index", this.index + 1);
                        break;
                    case "list":
                        if (this.index < this.playlist.relatedStreams.length) searchParams.set("list", params.list);
                        break;
                    default:
                        searchParams.set(param, params[param]);
                        break;
                }
            // save the fullscreen state
            searchParams.set("fullscreen", this.$refs.videoPlayer.$ui.getControls().isFullScreenEnabled());
            const paramStr = searchParams.toString();
            if (paramStr.length > 0) url += "&" + paramStr;
            this.$router.push(url);
        },
        downloadCurrentFrame() {
            const video = document.querySelector("video");
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext("2d");
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            let link = document.createElement("a");
            const currentTime = Math.round(video.currentTime * 1000) / 1000;
            link.download = `${this.video.title}_${currentTime}s.png`;
            link.href = canvas.toDataURL();
            link.click();
        },
    },
};
</script>

<style>
.v-enter-from,
.v-leave-to {
    opacity: 0;
    transform: translateX(100%) scale(0.5);
}

.description a {
    text-decoration: underline;
    filter: brightness(0.75);
}
</style>
