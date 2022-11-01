<template>
    <h1 v-t="'titles.feed'" class="font-bold text-center my-4" />

    <button class="btn mr-2" @click="exportHandler">
        <router-link to="/subscriptions">Subscriptions</router-link>
    </button>

    <span>
        <a :href="getRssUrl">
            <font-awesome-icon icon="rss" />
        </a>
    </span>

    <span class="md:float-right">
        <SortingSelector by-key="uploaded" @apply="order => videos.sort(order)" />
    </span>

    <hr />

    <div class="video-grid">
        <VideoItem :is-feed="true" v-for="video in videos" :key="video.url" :item="video" />
    </div>
</template>

<script>
import VideoItem from "./VideoItem.vue";
import SortingSelector from "./SortingSelector.vue";

export default {
    components: {
        VideoItem,
        SortingSelector,
    },
    data() {
        return {
            currentVideoCount: 0,
            videoStep: 100,
            videosStore: [],
            videos: [],
        };
    },
    computed: {
        getRssUrl(_this) {
            if (_this.authenticated) return _this.authApiUrl() + "/feed/rss?authToken=" + _this.getAuthToken();
            else return _this.authApiUrl() + "/feed/unauthenticated/rss?channels=" + _this.getUnauthenticatedChannels();
        },
    },
    mounted() {
        this.fetchFeed().then(videos => {
            this.videosStore = videos;
            this.loadMoreVideos();
            this.updateWatched(this.videos);
        });
    },
    activated() {
        document.title = this.$t("titles.feed") + " - Piped";
        if (this.videos.length > 0) this.updateWatched(this.videos);
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchFeed() {
            if (this.authenticated) {
                return await this.fetchJson(this.authApiUrl() + "/feed", {
                    authToken: this.getAuthToken(),
                });
            } else {
                return await this.fetchJson(this.authApiUrl() + "/feed/unauthenticated", {
                    channels: this.getUnauthenticatedChannels(),
                });
            }
        },
        loadMoreVideos() {
            this.currentVideoCount = Math.min(this.currentVideoCount + this.videoStep, this.videosStore.length);
            if (this.videos.length != this.videosStore.length)
                this.videos = this.videosStore.slice(0, this.currentVideoCount);
        },
        handleScroll() {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loadMoreVideos();
            }
        },
    },
};
</script>
