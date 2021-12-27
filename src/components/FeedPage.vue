<template>
    <h1 v-t="'titles.feed'" class="font-bold text-center" />

    <button v-if="authenticated" class="btn" style="margin-right: 0.5rem" @click="exportHandler">
        <router-link to="/subscriptions"> Subscriptions </router-link>
    </button>

    <span>
        <a :href="getRssUrl"><font-awesome-icon icon="rss" style="padding-top: 0.2rem"></font-awesome-icon></a>
    </span>

    <span class="md:float-right">
        <label for="ddlSortBy" v-text="$t('actions.sort_by')" />
        <select id="ddlSortBy" v-model="selectedSort" class="select w-auto" @change="onChange()">
            <option v-t="'actions.most_recent'" value="descending" />
            <option v-t="'actions.least_recent'" value="ascending" />
            <option v-t="'actions.channel_name_asc'" value="channel_ascending" />
            <option v-t="'actions.channel_name_desc'" value="channel_descending" />
        </select>
    </span>

    <hr />

    <div class="video-grid">
        <VideoItem v-for="video in videos" :key="video.url" :video="video" />
    </div>
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";

export default {
    components: {
        VideoItem,
    },
    data() {
        return {
            currentVideoCount: 0,
            videoStep: 100,
            videosStore: [],
            videos: [],
            selectedSort: "descending",
        };
    },
    computed: {
        getRssUrl(_this) {
            return _this.apiUrl() + "/feed/rss?authToken=" + _this.getAuthToken();
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
            return await this.fetchJson(this.apiUrl() + "/feed", {
                authToken: this.getAuthToken(),
            });
        },
        onChange() {
            switch (this.selectedSort) {
                case "ascending":
                    this.videos.sort((a, b) => a.uploaded - b.uploaded);
                    break;
                case "descending":
                    this.videos.sort((a, b) => b.uploaded - a.uploaded);
                    break;
                case "channel_ascending":
                    this.videos.sort((a, b) => a.uploaderName.localeCompare(b.uploaderName));
                    break;
                case "channel_descending":
                    this.videos.sort((a, b) => b.uploaderName.localeCompare(a.uploaderName));
                    break;
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
