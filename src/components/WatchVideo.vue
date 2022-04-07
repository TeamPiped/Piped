<template>
    <div v-if="video && isEmbed" class="absolute top-0 left-0 h-full w-full bg-black z-50">
        <VideoPlayer
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
            <VideoPlayer
                ref="videoPlayer"
                :video="video"
                :sponsors="sponsors"
                :selected-auto-play="selectedAutoPlay"
                :selected-auto-loop="selectedAutoLoop"
            />
            <div class="font-bold mt-2 text-2xl break-words" v-text="video.title" />

            <div class="flex mb-1.5">
                <span v-t="{ path: 'video.views', args: { views: addCommas(video.views) } }" />
                <span class="ml-2" v-text="uploadDate" />

                <div class="flex items-center relative ml-auto children:ml-2">
                    <template v-if="video.likes >= 0">
                        <div>
                            <font-awesome-icon icon="thumbs-up" />
                            <strong class="ml-2" v-text="addCommas(video.likes)" />
                        </div>
                        <div>
                            <font-awesome-icon icon="thumbs-down" />
                            <strong class="ml-2" v-text="video.dislikes >= 0 ? addCommas(video.dislikes) : '?'" />
                        </div>
                    </template>
                    <template v-if="video.likes < 0">
                        <div>
                            <strong v-t="'video.ratings_disabled'" />
                        </div>
                    </template>
                    <a :href="`https://youtu.be/${getVideoId()}`" class="btn">
                        <i18n-t keypath="player.watch_on" tag="strong">
                            <font-awesome-icon class="mx-1.5" :icon="['fab', 'youtube']" />
                        </i18n-t>
                    </a>
                    <a v-if="video.lbryId" :href="'https://odysee.com/' + video.lbryId" class="btn">
                        <i18n-t keypath="player.watch_on" tag="strong">LBRY</i18n-t>
                    </a>
                    <router-link
                        :to="toggleListenUrl"
                        :aria-label="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                        :title="(isListening ? 'Watch ' : 'Listen to ') + video.title"
                        class="btn"
                    >
                        <font-awesome-icon :icon="isListening ? 'tv' : 'headphones'" />
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
                    />
                    <font-awesome-icon class="ml-1" v-if="video.uploaderVerified" icon="check" />
                </div>
                <div class="relative ml-auto children:mx-2">
                    <button class="btn" v-if="authenticated" @click="showModal = !showModal">
                        {{ $t("actions.add_to_playlist") }}<font-awesome-icon class="ml-1" icon="circle-plus" />
                    </button>
                    <button
                        class="btn"
                        v-if="authenticated"
                        @click="subscribeHandler"
                        v-t="{
                            path: `actions.${subscribed ? 'unsubscribe' : 'subscribe'}`,
                            args: { count: numberFormat(video.uploaderSubscriberCount) },
                        }"
                    />
                </div>
                <PlaylistAddModal v-if="showModal" :video-id="getVideoId()" @close="showModal = !showModal" />
            </div>

            <hr />

            <button
                class="btn mb-2"
                @click="showDesc = !showDesc"
                v-t="`actions.${showDesc ? 'minimize_description' : 'show_description'}`"
            />
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-show="showDesc" class="break-words" v-html="purifyHTML(video.description)" />
            <Chapters v-if="video?.chapters?.length > 0" :chapters="video.chapters" @seek="navigate" />
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
                <CommentItem
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
                    v-t="`actions.${showRecs ? 'minimize_recommendations' : 'show_recommendations'}`"
                />
                <hr v-show="showRecs" />
                <div v-show="showRecs || !smallView">
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
import VideoPlayer from "@/components/VideoPlayer.vue";
import VideoItem from "@/components/VideoItem.vue";
import ErrorHandler from "@/components/ErrorHandler.vue";
import CommentItem from "@/components/CommentItem.vue";
import Chapters from "@/components/Chapters.vue";
import PlaylistAddModal from "./PlaylistAddModal.vue";

export default {
    name: "App",
    components: {
        VideoPlayer,
        VideoItem,
        ErrorHandler,
        CommentItem,
        Chapters,
        PlaylistAddModal,
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
            showModal: false,
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

                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(this.video.description, "text/html");
                        xmlDoc.querySelectorAll("a").forEach(elem => (elem.outerHTML = elem.getAttribute("href")));
                        xmlDoc.querySelectorAll("br").forEach(elem => (elem.outerHTML = "\n"));
                        this.video.description = this.urlify(xmlDoc.querySelector("body").innerHTML)
                            .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&]*)/gm, "$1")
                            .replaceAll(
                                /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&]*)/gm,
                                "/watch?v=$1",
                            )
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
        navigate(time) {
            this.$refs.videoPlayer.seek(time);
        },
    },
};
</script>
