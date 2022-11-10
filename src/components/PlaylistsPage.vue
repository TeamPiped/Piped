<template>
    <h1 class="font-bold text-center my-4" v-t="'titles.playlists'" />

    <hr />

    <div v-if="authenticated">
        <button v-t="'actions.create_playlist'" class="btn" @click="createPlaylist" />

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
    <div v-else class="text-center h-[65vh] flex flex-col justify-center items-center">
        <h1 v-t="'actions.not_logged_in'"></h1>
        <div class="flex mt-100 items-center children:(mx-30)">
            <button @click="showLoginModal = true" v-t="'titles.account'"></button>
            <a class="btn h-min!" href="/" v-t="'actions.back_to_home'"></a>
        </div>
    </div>
    <br />

    <LoginModal v-if="showLoginModal" @close="showLoginModal = !showLoginModal" />
</template>

<script>
import LoginModal from "./LoginModal.vue";

export default {
    components: {
        LoginModal,
    },
    data() {
        return {
            playlists: [],
            showLoginModal: false,
        };
    },
    mounted() {
        if (this.authenticated) this.fetchPlaylists();
        else this.showLoginModal = true;
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
        createPlaylist() {
            const name = prompt(this.$t("actions.create_playlist"));
            if (name)
                this.fetchJson(this.authApiUrl() + "/user/playlists/create", null, {
                    method: "POST",
                    body: JSON.stringify({
                        name: name,
                    }),
                    headers: {
                        Authorization: this.getAuthToken(),
                        "Content-Type": "application/json",
                    },
                }).then(json => {
                    if (json.error) alert(json.error);
                    else this.fetchPlaylists();
                });
        },
    },
};
</script>
