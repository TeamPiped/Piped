<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

    <div v-if="playlist" v-show="!playlist.error">
        <h1 class="text-center">
            <img :src="playlist.avatarUrl" height="48" width="48" loading="lazy" />
            {{ playlist.name }}
        </h1>

        <div class="grid grid-cols-2">
            <div>
                <b
                    ><router-link class="uk-text-justify" :to="playlist.uploaderUrl || '/'">
                        <img :src="playlist.uploaderAvatar" loading="lazy" class="rounded-full" />
                        {{ playlist.uploader }}</router-link
                    ></b
                >
            </div>
            <div>
                <div class="right-2vw absolute">
                    <b>{{ playlist.videos }} {{ $t("video.videos") }}</b>
                    <br />
                    <a :href="getRssUrl"><font-awesome-icon icon="rss"></font-awesome-icon></a>
                </div>
            </div>
        </div>

        <hr />

        <div class="video-grid">
            <div v-for="video in playlist.relatedStreams" :key="video.url">
                <VideoItem :video="video" height="94" width="168" />
            </div>
        </div>
    </div>
</template>

<script>
import ErrorHandler from "@/components/ErrorHandler.vue";
import VideoItem from "@/components/VideoItem.vue";

export default {
    components: {
        ErrorHandler,
        VideoItem,
    },
    data() {
        return {
            playlist: null,
        };
    },
    computed: {
        getRssUrl: _this => {
            return _this.apiUrl() + "/rss/playlists/" + _this.$route.query.list;
        },
    },
    mounted() {
        this.getPlaylistData();
    },
    activated() {
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchPlaylist() {
            return await await this.fetchJson(this.apiUrl() + "/playlists/" + this.$route.query.list);
        },
        async getPlaylistData() {
            this.fetchPlaylist()
                .then(data => (this.playlist = data))
                .then(() => (document.title = this.playlist.name + " - Piped"));
        },
        handleScroll() {
            if (this.loading || !this.playlist || !this.playlist.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.apiUrl() + "/nextpage/playlists/" + this.$route.query.list, {
                    nextpage: this.playlist.nextpage,
                }).then(json => {
                    this.playlist.relatedStreams.concat(json.relatedStreams);
                    this.playlist.nextpage = json.nextpage;
                    this.loading = false;
                    json.relatedStreams.map(stream => this.playlist.relatedStreams.push(stream));
                });
            }
        },
    },
};
</script>
