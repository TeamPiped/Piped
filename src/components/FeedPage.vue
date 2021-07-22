<template>
    <h1 class="uk-text-bold uk-text-center">Feed</h1>

    <small>You can import subscriptions from <router-link to="/import">here</router-link>.</small>

    <br />
    <router-link to="/subscriptions" class="uk-text-center">View Subscriptions</router-link>

    <div class="uk-align-right">
        <a :href="getRssUrl"><font-awesome-icon icon="rss"></font-awesome-icon></a>
    </div>

    <hr />

    <div class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            :style="[{ background: backgroundColor }]"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="video.url"
            v-for="video in videos"
        >
            <VideoItem :video="video" />
        </div>
    </div>
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";

export default {
    data() {
        return {
            videos: [],
        };
    },
    mounted() {
        this.fetchFeed().then(videos => (this.videos = videos));
    },
    activated() {
        document.title = "Feed - Piped";
    },
    methods: {
        async fetchFeed() {
            return await this.fetchJson(this.apiUrl() + "/feed", {
                authToken: this.getAuthToken(),
            });
        },
    },
    computed: {
        getRssUrl(_this) {
            return _this.apiUrl() + "/feed/rss?authToken=" + _this.getAuthToken();
        },
    },
    components: {
        VideoItem,
    },
};
</script>
