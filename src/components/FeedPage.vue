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

    <label for="filters" class="ml-10 mr-2">
        <strong v-text="`${$t('actions.filter')}:`" />
    </label>
    <select id="filters" v-model="selectedFilter" default="all" class="select w-auto" @change="onFilterChange()">
        <option v-for="filter in availableFilters" :key="filter" :value="filter" v-t="`video.${filter}`" />
    </select>

    <span class="md:float-right">
        <SortingSelector by-key="uploaded" @apply="order => videos.sort(order)" />
    </span>

    <hr />

    <LoadingIndicatorPage :show-content="videosStore != null" class="video-grid">
        <template v-for="video in videos" :key="video.url">
            <VideoItem v-if="shouldShowVideo(video)" :is-feed="true" :item="video" />
        </template>
    </LoadingIndicatorPage>
</template>

<script>
import VideoItem from "./VideoItem.vue";
import SortingSelector from "./SortingSelector.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";

export default {
    components: {
        VideoItem,
        SortingSelector,
        LoadingIndicatorPage,
    },
    data() {
        return {
            currentVideoCount: 0,
            videoStep: 100,
            videosStore: null,
            videos: [],
            availableFilters: ["all", "shorts", "videos"],
            selectedFilter: "all",
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

        this.selectedFilter = this.getPreferenceString("feedFilter") ?? "all";
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
        shouldShowVideo(video) {
            switch (this.selectedFilter.toLowerCase()) {
                case "shorts":
                    return video.isShort;
                case "videos":
                    return !video.isShort;
                default:
                    return true;
            }
        },
        onFilterChange() {
            this.setPreference("feedFilter", this.selectedFilter);
        },
    },
};
</script>
