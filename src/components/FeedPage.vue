<template>
    <hr />
    <div class="align-center flex flex-wrap" style="place-content: space-between; gap: var(--efy_gap0)">
        <span class="buttons flex" style="gap: var(--efy_gap0)">
            <router-link role="button" to="/subscriptions">Subscriptions</router-link>
            <a :href="getRssUrl" role="button" class="pp-square" style="padding: 0">
                <i class="i-fa6-solid:rss m-0" />
            </a>
        </span>

        <div class="align-center filters flex">
            <span class="flex">
                <label for="filters" v-text="`${$t('actions.filter')}:`" />
                <select
                    id="filters"
                    v-model="selectedFilter"
                    default="all"
                    class="select flex-grow"
                    @change="onFilterChange()"
                >
                    <option v-for="filter in availableFilters" :key="filter" v-t="`video.${filter}`" :value="filter" />
                </select>
            </span>

            <span class="flex">
                <label for="group-selector" v-text="`${$t('titles.channel_groups')}:`" />
                <select id="group-selector" v-model="selectedGroupName" default="" class="select flex-grow">
                    <option v-t="`video.all`" value="" />
                    <option
                        v-for="group in channelGroups"
                        :key="group.groupName"
                        :value="group.groupName"
                        v-text="group.groupName"
                    />
                </select>
            </span>

            <span class="pp-sortby-feed flex">
                <SortingSelector by-key="uploaded" @apply="order => videos.sort(order)" />
            </span>
        </div>
    </div>
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

            const videos = this.getPreferenceBoolean("hideWatched", false)
                ? this.videos.filter(video => !video.watched)
                : this.videos;

            return _this.selectedGroupName == ""
                ? videos
                : videos.filter(video => selectedGroup[0].channels.includes(video.uploaderUrl.substr(-24)));
        },
    },
    mounted() {
        this.fetchFeed().then(resp => {
            if (resp.error) {
                alert(resp.error);
                return;
            }

            this.videosStore = resp;
            this.loadMoreVideos();
            this.updateWatched(this.videos);
        });

        this.selectedFilter = this.getPreferenceString("feedFilter") ?? "all";

        if (!window.db) return;

        this.loadChannelGroups();
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
        async loadChannelGroups() {
            const groups = await this.getChannelGroups();
            this.channelGroups.push(...groups);
        },
        loadMoreVideos() {
            if (!this.videosStore) return;
            this.currentVideoCount = Math.min(this.currentVideoCount + this.videoStep, this.videosStore.length);
            if (this.videos.length != this.videosStore.length) {
                this.videos = this.videosStore.slice(0, this.currentVideoCount);
                this.fetchDeArrowContent(this.videos);
            }
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

<style>
.filters {
    flex-wrap: wrap;
}
.filters,
.filters span {
    gap: var(--efy_gap0);
}
.filters :is(select, label),
.buttons a[role="button"] {
    margin: 0 !important;
    white-space: nowrap;
    align-items: center;
    place-content: center;
}
.filters span {
    align-items: center;
}
.buttons a[role="button"] {
    height: var(--efy_ratio_width);
}
</style>
