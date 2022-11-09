<template>
    <h1 v-t="'titles.trending'" class="font-bold text-center my-4" />

    <hr />

    <div class="video-grid">
        <VideoItem v-for="video in videos" :key="video.url" :item="video" height="118" width="210" />
    </div>
</template>

<script>
import VideoItem from "./VideoItem.vue";

export default {
    components: {
        VideoItem,
    },
    data() {
        return {
            videos: [],
        };
    },
    mounted() {
        let region = this.getPreferenceString("region", "US");

        this.fetchTrending(region).then(videos => {
            this.videos = videos;
            this.updateWatched(this.videos);
        });
    },
    activated() {
        document.title = this.$t("titles.trending") + " - Piped";
        if (this.videos.length > 0) this.updateWatched(this.videos);
        if (this.$route.path == "/") {
            switch (this.getPreferenceString("homepage", "trending")) {
                case "trending":
                    break;
                case "feed":
                    this.$router.push("/feed");
                    return;
                default:
                    break;
            }
        }
    },
    methods: {
        async fetchTrending(region) {
            return await this.fetchJson(this.apiUrl() + "/trending", {
                region: region || "US",
            });
        },
    },
};
</script>
