<template>
    <h1 v-t="'titles.feed'" class="font-bold text-center" />

    <button v-if="authenticated" class="btn mr-2" @click="exportHandler">
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
        <VideoItem v-for="video in videos" :key="video.url" :video="video" />
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
            return _this.apiUrl() + "/feed/rss?authToken=" + _this.getAuthToken();
        },
    },
    mounted() {
        if (this.authenticated)
            this.fetchFeed().then(videos => {
                this.videosStore = videos;
                this.loadMoreVideos();
                this.updateWatched(this.videos);
            });
        else this.$router.push("/login");
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
            return await this.fetchJson(this.apiUrl() + "/feed", {
                authToken: this.getAuthToken(),
            });
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
