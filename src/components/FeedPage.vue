<template>
    <h1 v-t="'titles.feed'" class="uk-text-bold uk-text-center" />

    <button
        v-if="authenticated"
        class="uk-button uk-button-small"
        style="background: #222; margin-right: 0.5rem"
        type="button"
        @click="exportHandler"
    >
        <router-link to="/subscriptions">
            Subscriptions
        </router-link>
    </button>

    <span>
        <a :href="getRssUrl"><font-awesome-icon icon="rss" style="padding-top: 0.2rem"></font-awesome-icon></a>
    </span>

    <span class="uk-align-right@m">
        <label for="ddlSortBy">{{ $t("actions.sort_by") }}</label>
        <select id="ddlSortBy" v-model="selectedSort" class="uk-select uk-width-auto" @change="onChange()">
            <option v-t="'actions.most_recent'" value="descending" />
            <option v-t="'actions.least_recent'" value="ascending" />
            <option v-t="'actions.channel_name_asc'" value="channel_ascending" />
            <option v-t="'actions.channel_name_desc'" value="channel_descending" />
        </select>
    </span>

    <hr />

    <div class="uk-grid-xl" uk-grid="parallax: 0" style="padding-left: 25px;">
        <div
            v-for="video in videos"
            :key="video.url"
            :style="[{ background: backgroundColor, paddingLeft: '15px' }]"
            class="uk-width-1-1 uk-width-1-3@s uk-width-1-4@m uk-width-1-4@l uk-width-1-5@xl"
        >
            <VideoItem :video="video" />
        </div>
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
