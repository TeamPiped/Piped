<template>
    <h1 class="font-bold text-center my-4" v-t="'titles.playlists'" />

    <hr />

    <div>
        <div class="flex justify-between">
            <button v-t="'actions.create_playlist'" class="btn mr-2" @click="onCreatePlaylist" />
            <div class="flex">
                <button
                    v-if="this.playlists.length > 0"
                    v-t="'actions.export_to_json'"
                    class="btn"
                    @click="exportPlaylists"
                />
                <input
                    id="fileSelector"
                    ref="fileSelector"
                    type="file"
                    class="display-none"
                    @change="importPlaylists"
                />
                <label for="fileSelector" v-t="'actions.import_from_json'" class="btn ml-2" role="button" />
            </div>
        </div>

        <div class="video-grid">
            <div v-for="playlist in playlists" :key="playlist.id" class="efy_trans_filter">
                <router-link :to="`/playlist?list=${playlist.id}`">
                    <img class="w-full" :src="playlist.thumbnail" alt="thumbnail" />
                    <p
                        style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                        class="flex link"
                        :title="playlist.name"
                        v-text="playlist.name"
                    />
                </router-link>
                <div class="pp-video-card-buttons flex gap-15rem children:m-0" style="flex-wrap: wrap">
                    <button
                        class="thumbnail-overlay thumbnail-right"
                        v-text="`${playlist.videos} ${$t('video.videos')}`"
                    />
                    <button
                        class="pp-color h-auto"
                        @click="renamePlaylist(playlist.id)"
                        v-t="'actions.rename_playlist'"
                    />
                    <button
                        class="pp-color h-auto"
                        @click="deletePlaylist(playlist.id)"
                        v-t="'actions.delete_playlist'"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            playlists: [],
        };
    },
    mounted() {
        if (this.authenticated) this.fetchPlaylists();
        else this.$router.push("/login");
    },
    activated() {
        document.title = this.$t("titles.playlists") + " - Piped";
    },
    methods: {
        fetchPlaylists() {
            this.fetchJson(this.authApiUrl() + "/user/playlists", null, {
                headers: {
                    Authorization: this.getAuthToken(),
                },
            }).then(json => {
                this.playlists = json;
            });
        },
        renamePlaylist(id) {
            const newName = prompt(this.$t("actions.new_playlist_name"));
            if (!newName) return;
            this.fetchJson(this.authApiUrl() + "/user/playlists/rename", null, {
                method: "POST",
                body: JSON.stringify({
                    playlistId: id,
                    newName: newName,
                }),
                headers: {
                    Authorization: this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            }).then(json => {
                if (json.error) alert(json.error);
                else {
                    this.playlists.forEach((playlist, index) => {
                        if (playlist.id == id) {
                            this.playlists[index].name = newName;
                            return;
                        }
                    });
                }
            });
        },
        deletePlaylist(id) {
            if (confirm(this.$t("actions.delete_playlist_confirm")))
                this.fetchJson(this.authApiUrl() + "/user/playlists/delete", null, {
                    method: "POST",
                    body: JSON.stringify({
                        playlistId: id,
                    }),
                    headers: {
                        Authorization: this.getAuthToken(),
                        "Content-Type": "application/json",
                    },
                }).then(json => {
                    if (json.error) alert(json.error);
                    else this.playlists = this.playlists.filter(playlist => playlist.id !== id);
                });
        },
        onCreatePlaylist() {
            const name = prompt(this.$t("actions.create_playlist"));
            if (!name) return;
            this.createPlaylist(name).then(json => {
                if (json.error) alert(json.error);
                else this.fetchPlaylists();
            });
        },
        async createPlaylist(name) {
            let json = await this.fetchJson(this.authApiUrl() + "/user/playlists/create", null, {
                method: "POST",
                body: JSON.stringify({
                    name: name,
                }),
                headers: {
                    Authorization: this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            });
            return json;
        },
        async exportPlaylists() {
            if (!this.playlists) return;
            let json = {
                format: "Piped",
                version: 1,
                playlists: [],
            };
            let tasks = this.playlists.map(playlist => this.fetchPlaylistJson(playlist.id));
            json.playlists = await Promise.all(tasks);
            this.download(JSON.stringify(json), "playlists.json", "application/json");
        },
        async fetchPlaylistJson(playlistId) {
            let playlist = await this.fetchJson(this.authApiUrl() + "/playlists/" + playlistId);
            let playlistJson = {
                name: playlist.name,
                // possible other types: history, watch later, ...
                type: "playlist",
                // as Invidious supports public and private playlists
                visibility: "private",
                // list of the videos, starting with "https://youtube.com" to clarify that those are YT videos
                videos: playlist.relatedStreams.map(stream => "https://youtube.com" + stream.url),
            };
            return playlistJson;
        },
        async importPlaylists() {
            const file = this.$refs.fileSelector.files[0];
            let text = await file.text();
            let tasks = [];
            // list of playlists exported from Piped
            if (text.includes("playlists")) {
                let playlists = JSON.parse(text).playlists;
                if (!playlists.length) {
                    alert(this.$t("actions.no_valid_playlists"));
                    return;
                }
                for (var i = 0; i < playlists.length; i++) {
                    tasks.push(this.createPlaylistWithVideos(playlists[i]));
                }
                // CSV from Google Takeout
            } else if (file.name.slice(-4).toLowerCase() == ".csv") {
                const lines = text.split("\n");
                const playlist = {
                    name: lines[1].split(",")[4],
                    videos: lines
                        .slice(4, lines.length)
                        .filter(line => line != "")
                        .map(line => `https://youtube.com/watch?v=${line.split(",")[0]}`),
                };
                tasks.push(this.createPlaylistWithVideos(playlist));
            } else {
                alert(this.$t("actions.no_valid_playlists"));
                return;
            }
            await Promise.all(tasks);
            window.location.reload();
        },
        async createPlaylistWithVideos(playlist) {
            let newPlaylist = await this.createPlaylist(playlist.name);
            let videoIds = playlist.videos.map(url => url.substr(-11));
            await this.addVideosToPlaylist(newPlaylist.playlistId, videoIds);
        },
        async addVideosToPlaylist(playlistId, videoIds) {
            await this.fetchJson(this.authApiUrl() + "/user/playlists/add", null, {
                method: "POST",
                body: JSON.stringify({
                    playlistId: playlistId,
                    videoIds: videoIds,
                }),
                headers: {
                    Authorization: this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            });
        },
    },
};
</script>
