<template>
    <div class="uk-container uk-container-xlarge">
        <Player ref="videoPlayer" :video="video" :sponsors="sponsors" :selectedAutoPlay="selectedAutoPlay" />
        <h1 class="uk-text-bold">{{ video.title }}</h1>

        <img :src="video.uploaderAvatar" loading="lazy" />
        <router-link class="uk-text-bold" v-bind:to="video.uploaderUrl || '/'">
            <a>{{ video.uploader }}</a>
        </router-link>

        <p class="uk-dark">
            <font-awesome-icon icon="thumbs-up"></font-awesome-icon>
            <b>{{ video.likes }}</b>
            &nbsp;
            <font-awesome-icon icon="thumbs-down"></font-awesome-icon>
            <b>{{ video.dislikes }}</b>
        </p>
        <p>
            <font-awesome-icon icon="eye"></font-awesome-icon>
            <b>{{ video.views }}</b> views
        </p>
        <p>
            Uploaded on <b>{{ video.uploadDate }}</b>
        </p>
        <a class="uk-button uk-button-small" style="background: #222" @click="showDesc = !showDesc">
            {{ showDesc ? "+" : "-" }}
        </a>
        <p v-show="showDesc" class="uk-light" v-html="video.description"></p>
        <a v-if="sponsors && sponsors.segments">Sponsors Segments: {{ sponsors.segments.length }}</a>

        <hr />

        <b>Auto Play next Video:</b>&nbsp;
        <input class="uk-checkbox" v-model="selectedAutoPlay" @change="onChange($event)" type="checkbox" />

        <div
            class="uk-tile-default uk-text-secondary"
            style="background: #0b0e0f; width: 300px"
            v-bind:key="related.url"
            v-for="related in video.relatedStreams"
        >
            <router-link class="uk-link-muted" v-bind:to="related.url">
                <p class="uk-text-emphasis">{{ related.title }}</p>
                <img style="width: 100%" v-bind:src="related.thumbnail" loading="lazy" />
            </router-link>
            <p>
                <router-link class="uk-link-muted" v-bind:to="related.uploaderUrl || '/'">
                    <p>{{ related.uploaderName }}</p>
                </router-link>
                <font-awesome-icon icon="eye"></font-awesome-icon>
                {{ related.views }} views
            </p>
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";
import Player from "@/components/Player.vue";

export default {
    name: "App",
    data() {
        return {
            video: {
                title: "Loading...",
            },
            sponsors: null,
            selectedAutoPlay: null,
            showDesc: true,
        };
    },
    mounted() {
        this.selectedAutoPlay = Constants.AUTO_PLAY;
        this.getVideoData();
        this.getSponsors();
    },
    watch: {
        "$route.query.v": function(v) {
            if (v) {
                this.getVideoData();
                this.getSponsors();
            }
        },
    },
    methods: {
        fetchVideo() {
            return this.fetchJson(Constants.BASE_URL + "/streams/" + this.$route.query.v);
        },
        async fetchSponsors() {
            return await this.fetchJson(
                Constants.BASE_URL +
                    "/sponsors/" +
                    this.$route.query.v +
                    "?category=" +
                    (localStorage && localStorage.getItem("selectedSkip")
                        ? encodeURIComponent('["' + localStorage.getItem("selectedSkip").replace(",", '","') + '"]')
                        : encodeURIComponent('["sponsor", "interaction", "selfpromo", "music_offtopic"]')),
            );
        },
        onChange() {
            if (localStorage) localStorage.setItem("autoplay", this.selectedAutoPlay);
        },
        async getVideoData() {
            this.fetchVideo()
                .then(data => {
                    this.video = data;
                })
                .then(() => {
                    document.title = this.video.title + " - Piped";

                    this.video.description = this.video.description
                        .replaceAll("http://www.youtube.com", "")
                        .replaceAll("https://www.youtube.com", "")
                        .replaceAll("\n", "<br>");

                    this.$refs.videoPlayer.loadVideo();
                });
        },
        async getSponsors() {
            if (!localStorage || localStorage.getItem("sponsorblock") !== false)
                this.fetchSponsors().then(data => (this.sponsors = data));
        },
    },
    components: {
        Player,
    },
};
</script>
