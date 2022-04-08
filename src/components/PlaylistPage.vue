<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

    <div v-if="playlist" v-show="!playlist.error">
        <h1 class="text-center" v-text="playlist.name" />

        <div class="grid grid-cols-2">
            <div>
                <router-link class="link" :to="playlist.uploaderUrl || '/'">
                    <img :src="playlist.uploaderAvatar" loading="lazy" class="rounded-full" />
                    <strong v-text="playlist.uploader" />
                </router-link>
            </div>
            <div>
                <div class="right-2vw absolute">
                    <strong v-text="`${playlist.videos} ${$t('video.videos')}`" />
                    <br />
                    <a :href="getRssUrl">
                        <font-awesome-icon icon="rss" />
                    </a>
                </div>
            </div>
        </div>

        <hr />

        <div class="video-grid">
            <VideoItem
                v-for="(video, index) in playlist.relatedStreams"
                :key="video.url"
                :video="video"
                :index="index"
                :playlist-id="$route.query.list"
                :admin="admin"
                @remove="removeVideo(index)"
                height="94"
                width="168"
            />
        </div>
    </div>
</template>

<script>
import ErrorHandler from "./ErrorHandler.vue";
import VideoItem from "./VideoItem.vue";

export default {
    components: {
        ErrorHandler,
        VideoItem,
    },
    data() {
        return {
            playlist: null,
            admin: false,
        };
    },
    computed: {
        getRssUrl: _this => {
            return _this.apiUrl() + "/rss/playlists/" + _this.$route.query.list;
        },
    },
    mounted() {
        this.getPlaylistData();
        const playlistId = this.$route.query.list;
        if (this.authenticated && playlistId?.length == 36)
            this.fetchJson(this.apiUrl() + "/user/playlists", null, {
                headers: {
                    Authorization: this.getAuthToken(),
                },
            }).then(json => {
                if (json.error) alert(json.error);
                else if (json.filter(playlist => playlist.id === playlistId).length > 0) this.admin = true;
            });
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
        removeVideo(index) {
            this.playlist.relatedStreams.splice(index, 1);
        },
    },
};
</script>
