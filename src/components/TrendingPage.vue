<template>
    <h1 class="uk-text-bold uk-text-center">Trending</h1>

    <hr />

    <div class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            style="background: #0b0e0f"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="video.url"
            v-for="video in videos"
        >
            <div class="uk-text-secondary" style="background: #0b0e0f">
                <router-link class="uk-text-emphasis" v-bind:to="video.url || '/'">
                    <img
                        height="118"
                        width="210"
                        style="width: 100%"
                        v-bind:src="video.thumbnail"
                        alt="thumbnail"
                        loading="lazy"
                    />
                    <p>{{ video.title }}</p>
                </router-link>
                <router-link class="uk-link-muted" v-bind:to="video.uploaderUrl || '/'">
                    <p>{{ video.uploaderName }}</p>
                </router-link>
                <b class="uk-text-small uk-align-left">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    {{ video.views }} views
                    <br />
                    {{ video.uploadedDate }}
                </b>
                <b class="uk-text-small uk-align-right">
                    {{ timeFormat(video.duration) }}
                </b>
            </div>
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";

export default {
    data() {
        return {
            videos: [],
        };
    },
    mounted() {
        document.title = "Trending - Piped";

        this.fetchTrending().then(videos => (this.videos = videos));
    },
    methods: {
        async fetchTrending() {
            return await this.fetchJson(Constants.BASE_URL + "/trending");
        },
    },
};
</script>
