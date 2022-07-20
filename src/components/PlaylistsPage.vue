<template>
    <h1 class="font-bold text-center my-4" v-t="'titles.playlists'" />

    <hr />

    <button v-t="'actions.create_playlist'" class="btn" @click="createPlaylist" />

    <div class="video-grid">
        <div v-for="playlist in playlists" :key="playlist.id">
            <router-link :to="`/playlist?list=${playlist.id}`">
                <img class="w-full" :src="playlist.thumbnail" alt="thumbnail" />
                <p
                    style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                    class="my-2 overflow-hidden flex link"
                    :title="playlist.name"
                    v-text="playlist.name"
                />
            </router-link>
            <button class="btn h-auto" @click="deletePlaylist(playlist.id)" v-t="'actions.delete_playlist'" />
        </div>
    </div>
    <br />
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
            this.fetchJson(this.apiUrl() + "/user/playlists", null, {
                headers: {
                    Authorization: this.getAuthToken(),
                },
            }).then(json => {
                this.playlists = json;
            });
        },
        deletePlaylist(id) {
            if (confirm(this.$t("actions.delete_playlist_confirm")))
                this.fetchJson(this.apiUrl() + "/user/playlists/delete", null, {
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
                this.fetchJson(this.apiUrl() + "/user/playlists/create", null, {
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
