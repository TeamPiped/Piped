<template>
    <ModalComponent>
        <span class="text-2xl w-max inline-block" v-t="'actions.select_playlist'" />
        <select class="select w-full mt-3" v-model="selectedPlaylist">
            <option v-for="playlist in playlists" :value="playlist.id" :key="playlist.id" v-text="playlist.name" />
        </select>
        <div class="flex justify-end mt-3">
            <button
                class="btn"
                @click="handleClick(selectedPlaylist)"
                ref="addButton"
                v-t="'actions.add_to_playlist'"
            />
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ModalComponent,
    },
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
        this.selectedPlaylist = this.getPreferenceString("selectedPlaylist" + this.hashCode(this.authApiUrl()));
        window.addEventListener("keydown", this.handleKeyDown);
        window.blur();
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
            if (event.code === "Enter") {
                this.handleClick(this.selectedPlaylist);
                event.preventDefault();
            }
        },
        handleClick(playlistId) {
            if (!playlistId) {
                alert(this.$t("actions.please_select_playlist"));
                return;
            }

            if (this.processing) return;

            this.$refs.addButton.disabled = true;
            this.processing = true;

            this.fetchJson(this.authApiUrl() + "/user/playlists/add", null, {
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
                this.setPreference("selectedPlaylist" + this.hashCode(this.authApiUrl()), playlistId);
                this.$emit("close");
                if (json.error) alert(json.error);
            });
        },
        async fetchPlaylists() {
            this.fetchJson(this.authApiUrl() + "/user/playlists", null, {
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
