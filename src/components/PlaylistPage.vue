<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

    <LoadingIndicatorPage v-show="!playlist?.error" :show-content="playlist">
        <h1 class="mb-1 ml-1 mt-4 text-3xl!" v-text="playlist.name" />

        <CollapsableText v-if="playlist?.description" :text="playlist.description" />

        <div class="mt-1 flex justify-between <md:flex-col md:items-center">
            <div>
                <router-link class="link flex items-center gap-3" :to="playlist.uploaderUrl || '/'">
                    <img loading="lazy" :src="playlist.uploaderAvatar" class="h-12 rounded-full" />
                    <strong v-text="playlist.uploader" />
                </router-link>
            </div>
            <div class="flex flex-wrap items-center gap-1">
                <strong v-text="`${playlist.videos} ${$t('video.videos')}`" />
                <button v-if="!isPipedPlaylist" class="btn mx-1" @click="bookmarkPlaylist">
                    {{ $t(`actions.${isBookmarked ? "playlist_bookmarked" : "bookmark_playlist"}`)
                    }}<i class="i-fa6-solid:bookmark ml-3" />
                </button>
                <button v-if="authenticated && !isPipedPlaylist" class="btn mr-1" @click="clonePlaylist">
                    {{ $t("actions.clone_playlist") }}<i class="i-fa6-solid:clone ml-3" />
                </button>
                <button class="btn mr-1" @click="downloadPlaylistAsTxt">
                    {{ $t("actions.download_as_txt") }}
                </button>
                <a class="btn mr-1" :href="getRssUrl">
                    <i class="i-fa6-solid:rss" />
                </a>
                <WatchOnButton :link="`https://www.youtube.com/playlist?list=${$route.query.list}`" />
            </div>
        </div>

        <hr />

        <div class="video-grid">
            <VideoItem
                v-for="(video, index) in playlist.relatedStreams"
                :key="video.url"
                :item="video"
                :index="index"
                :playlist-id="$route.query.list"
                :admin="admin"
                height="94"
                width="168"
                @remove="removeVideo(index)"
            />
        </div>
    </LoadingIndicatorPage>
</template>

<script>
import ErrorHandler from "./ErrorHandler.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import CollapsableText from "./CollapsableText.vue";
import VideoItem from "./VideoItem.vue";
import WatchOnButton from "./WatchOnButton.vue";

export default {
    components: {
        ErrorHandler,
        VideoItem,
        WatchOnButton,
        LoadingIndicatorPage,
        CollapsableText,
    },
    data() {
        return {
            playlist: null,
            admin: false,
            isBookmarked: false,
        };
    },
    computed: {
        getRssUrl: _this => {
            return _this.authApiUrl() + "/rss/playlists/" + _this.$route.query.list;
        },
        isPipedPlaylist: _this => {
            // regex to determine whether it's a Piped plalylist
            return /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}/.test(
                _this.$route.query.list,
            );
        },
    },
    mounted() {
        const playlistId = this.$route.query.list;
        if (this.authenticated && playlistId?.length == 36)
            this.getPlaylists().then(json => {
                if (json.error) alert(json.error);
                else if (json.some(playlist => playlist.id === playlistId)) this.admin = true;
            });
        else if (playlistId.startsWith("local")) this.admin = true;
        this.isPlaylistBookmarked();
    },
    activated() {
        this.getPlaylistData();
        window.addEventListener("scroll", this.handleScroll);
        if (this.playlist) this.updateTitle();
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async getPlaylistData() {
            this.getPlaylist(this.$route.query.list)
                .then(data => (this.playlist = data))
                .then(() => {
                    this.updateTitle();
                    this.updateWatched(this.playlist.relatedStreams);
                    this.fetchDeArrowContent(this.playlist.relatedStreams);
                });
        },
        async updateTitle() {
            document.title = this.playlist.name + " - Piped";
        },
        handleScroll() {
            if (this.loading || !this.playlist || !this.playlist.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.authApiUrl() + "/nextpage/playlists/" + this.$route.query.list, {
                    nextpage: this.playlist.nextpage,
                }).then(json => {
                    this.playlist.relatedStreams.concat(json.relatedStreams);
                    this.playlist.nextpage = json.nextpage;
                    this.loading = false;
                    json.relatedStreams.map(stream => this.playlist.relatedStreams.push(stream));
                    this.fetchDeArrowContent(this.playlist.relatedStreams);
                });
            }
        },
        removeVideo(index) {
            this.playlist.relatedStreams.splice(index, 1);
        },
        async clonePlaylist() {
            this.fetchJson(this.authApiUrl() + "/import/playlist", null, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthToken(),
                },
                body: JSON.stringify({
                    playlistId: this.$route.query.list,
                }),
            }).then(resp => {
                if (!resp.error) {
                    alert(this.$t("actions.clone_playlist_success"));
                } else alert(resp.error);
            });
        },
        downloadPlaylistAsTxt() {
            var data = "";
            this.playlist.relatedStreams.forEach(element => {
                data += "https://piped.video" + element.url + "\n";
            });
            this.download(data, this.playlist.name + ".txt", "text/plain");
        },
        async bookmarkPlaylist() {
            if (!this.playlist) return;

            if (this.isBookmarked) {
                this.removePlaylistBookmark();
                return;
            }

            if (window.db) {
                const playlistId = this.$route.query.list;
                var tx = window.db.transaction("playlist_bookmarks", "readwrite");
                var store = tx.objectStore("playlist_bookmarks");
                store.put({
                    playlistId: playlistId,
                    name: this.playlist.name,
                    uploader: this.playlist.uploader,
                    uploaderUrl: this.playlist.uploaderUrl,
                    thumbnail: this.playlist.thumbnailUrl,
                    uploaderAvatar: this.playlist.uploaderAvatar,
                    videos: this.playlist.videos,
                });
                this.isBookmarked = true;
            }
        },
        async removePlaylistBookmark() {
            var tx = window.db.transaction("playlist_bookmarks", "readwrite");
            var store = tx.objectStore("playlist_bookmarks");
            store.delete(this.$route.query.list);
            this.isBookmarked = false;
        },
        async isPlaylistBookmarked() {
            // needed in order to change the is bookmarked var later
            const App = this;
            const playlistId = this.$route.query.list;
            var tx = window.db.transaction("playlist_bookmarks", "readwrite");
            var store = tx.objectStore("playlist_bookmarks");
            var req = store.openCursor(playlistId);
            req.onsuccess = function (e) {
                var cursor = e.target.result;
                App.isBookmarked = cursor ? true : false;
            };
        },
    },
};
</script>
