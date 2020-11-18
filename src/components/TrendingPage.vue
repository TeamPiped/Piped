<template>
    <h1 class="uk-text-bold uk-text-center">Trending</h1>

    <hr />

    <div class="uk-grid-collapse" uk-grid="parallax: 0">
        <div
            style="background: #0b0e0f"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="video.url"
            v-for="video in videos"
        >
            <div
                class="uk-card uk-card-default uk-card-body uk-grid-match uk-text-secondary"
                style="background: #0b0e0f"
            >
                <router-link
                    class="uk-text-emphasis"
                    v-bind:to="video.url || '/'"
                >
                    <p>{{ video.title }}</p>
                    <img style="width: 100%" v-bind:src="video.thumbnail" />
                </router-link>
                <router-link
                    class="uk-link-muted"
                    v-bind:to="video.uploaderUrl || '/'"
                >
                    <p>{{ video.uploaderName }}</p>
                </router-link>
                <font-awesome-icon icon="eye"></font-awesome-icon>
                {{ video.views }} views
            </div>
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";

export default {
    data() {
        return {
            videos: []
        };
    },
    mounted() {
        document.title = "Trending - Piped";

        this.fetchTrending().then(videos => (this.videos = videos));
    },
    methods: {
        async fetchTrending() {
            return await (await fetch(Constants.BASE_URL + "/trending")).json();
        }
    }
};
</script>
