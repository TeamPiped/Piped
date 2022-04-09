<template>
    <div class="modal">
        <div>
            <div class="modal-container">
                <div class="flex">
                    <span class="text-2xl w-max inline-block" v-t="'actions.select_playlist'" />
                    <button class="ml-3" @click="$emit('close')"><font-awesome-icon icon="xmark" /></button>
                </div>
                <select class="select w-full" v-model="selectedPlaylist">
                    <option
                        v-for="playlist in playlists"
                        :value="playlist.id"
                        :key="playlist.id"
                        v-text="playlist.name"
                    />
                </select>
                <button
                    class="btn mt-2"
                    @click="handleClick(selectedPlaylist)"
                    ref="addButton"
                    v-t="'actions.add_to_playlist'"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
.modal {
    @apply fixed z-50 top-0 left-0 w-full h-full bg-dark-900 bg-opacity-80 transition-opacity table;
}

.modal > div {
    @apply table-cell align-middle;
}

.modal-container {
    @apply w-min m-auto px-8 bg-dark-700 p-6;
}
</style>

<script>
export default {
    props: {
        videoId: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            playlists: [],
            selectedPlaylist: null,
            processing: false,
        };
    },
    mounted() {
        this.fetchPlaylists();
        this.selectedPlaylist = this.getPreferenceString("selectedPlaylist" + this.hashCode(this.apiUrl()));
        window.addEventListener("keydown", this.handleKeyDown);
        window.blur();
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
            if (event.code === "Escape") {
                this.$emit("close");
            } else if (event.code === "Enter") {
                this.handleClick(this.selectedPlaylist);
            } else return;
            event.preventDefault();
        },
        handleClick(playlistId) {
            if (!playlistId) {
                alert(this.$t("actions.please_select_playlist"));
                return;
            }

            if (this.processing) return;

            this.$refs.addButton.disabled = true;
            this.processing = true;

            this.fetchJson(this.apiUrl() + "/user/playlists/add", null, {
                method: "POST",
                body: JSON.stringify({
                    playlistId: playlistId,
                    videoId: this.videoId,
                }),
                headers: {
                    Authorization: this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            }).then(json => {
                this.setPreference("selectedPlaylist" + this.hashCode(this.apiUrl()), playlistId);
                this.$emit("close");
                if (json.error) alert(json.error);
            });
        },
        async fetchPlaylists() {
            this.fetchJson(this.apiUrl() + "/user/playlists", null, {
                headers: {
                    Authorization: this.getAuthToken(),
                },
            }).then(json => {
                this.playlists = json;
            });
        },
    },
};
</script>
