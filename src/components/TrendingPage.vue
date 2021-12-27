<template>
    <h1 v-t="'titles.trending'" class="uk-text-bold uk-text-center" />

    <hr />

    <div class="video-grid">
        <div v-for="video in videos" :key="video.url" :style="[{ background: backgroundColor }]">
            <VideoItem :video="video" height="118" width="210" />
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
