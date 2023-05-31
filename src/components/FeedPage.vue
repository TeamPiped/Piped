<template>
    <h1 v-t="'titles.feed'" class="font-bold text-center my-4" />

    <div class="flex flex-wrap md:items-center flex-col md:flex-row gap-2 children:(flex gap-1 items-center)">
        <span>
            <label for="filters">
                <strong v-text="`${$t('actions.filter')}:`" />
            </label>
            <select
                id="filters"
                v-model="selectedFilter"
                default="all"
                class="select flex-grow"
                @change="onFilterChange()"
            >
                <option v-for="filter in availableFilters" :key="filter" :value="filter" v-t="`video.${filter}`" />
            </select>
        </span>

        <span>
            <label for="group-selector">
                <strong v-text="`${$t('titles.channel_groups')}:`" />
            </label>
            <select id="group-selector" v-model="selectedGroupName" default="" class="select flex-grow">
                <option value="" v-t="`video.all`" />
                <option
                    v-for="group in channelGroups"
                    :key="group.groupName"
                    :value="group.groupName"
                    v-text="group.groupName"
                />
            </select>
        </span>

        <span class="md:ml-auto">
            <SortingSelector by-key="uploaded" @apply="order => videos.sort(order)" />
        </span>
    </div>
    <hr />

    <span class="flex gap-2">
        <router-link class="btn" to="/subscriptions">Subscriptions</router-link>
        <a :href="getRssUrl" class="btn">
            <font-awesome-icon icon="rss" />
        </a>
    </span>
    <hr />

    <LoadingIndicatorPage :show-content="videosStore != null" class="video-grid">
        <template v-for="video in filteredVideos" :key="video.url">
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
            selectedGroupName: "",
            channelGroups: [],
        };
    },
    computed: {
        getRssUrl(_this) {
            if (_this.authenticated) return _this.authApiUrl() + "/feed/rss?authToken=" + _this.getAuthToken();
            else return _this.authApiUrl() + "/feed/unauthenticated/rss?channels=" + _this.getUnauthenticatedChannels();
        },
        filteredVideos(_this) {
            const selectedGroup = _this.channelGroups.filter(group => group.groupName == _this.selectedGroupName);
            return _this.selectedGroupName == ""
                ? _this.videos
                : _this.videos.filter(video => selectedGroup[0].channels.includes(video.uploaderUrl.substr(-11)));
        },
    },
    mounted() {
        this.fetchFeed().then(videos => {
            this.videosStore = videos;
            this.loadMoreVideos();
            this.updateWatched(this.videos);
        });

        this.selectedFilter = this.getPreferenceString("feedFilter") ?? "all";

        if (!window.db) return;

        const cursor = this.getChannelGroupsCursor();
        cursor.onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
                const group = cursor.value;
                this.channelGroups.push({
                    groupName: group.groupName,
                    channels: JSON.parse(group.channels),
                });
                cursor.continue();
            }
        };
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
