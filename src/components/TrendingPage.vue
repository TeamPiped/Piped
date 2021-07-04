<template>
    <h1 class="uk-text-bold uk-text-center">Trending</h1>

    <hr />

    <div class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            :style="[{ background: backgroundColor }]"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="video.url"
            v-for="video in videos"
        >
            <VideoItem :video="video" height="118" width="210" />
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";
import VideoItem from "@/components/VideoItem.vue";

export default {
    data() {
        return {
            videos: [],
        };
    },
    mounted() {
        document.title = "Trending - Piped";

        let region = this.$route.query.region;

        this.fetchTrending(region).then(videos => (this.videos = videos));
    },
    methods: {
        async fetchTrending(region) {
            let url = Constants.BASE_URL + "/trending";
            if (region) {
                url += "?region=" + region;
            }
            return await this.fetchJson(url);
        },
    },
    components: {
        VideoItem,
    },
};
</script>
