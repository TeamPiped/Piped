<template>
    <ModalComponent @close="$emit('close')">
        <h4 v-t="'actions.select_playlist'" class="mb-2" />
        <select v-model="selectedPlaylist" class="select mb-2 w-full">
            <option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id" v-text="playlist.name" />
        </select>
        <div class="flex justify-end" style="gap: var(--efy_gap0)">
            <button
                ref="addButton"
                v-t="'actions.create_playlist'"
                class="btn pp-color"
                @click="showCreatePlaylistModal = true"
            />
            <button
                ref="addButton"
                v-t="'actions.add_to_playlist'"
                class="btn pp-color"
                @click="handleClick(selectedPlaylist)"
            />
        </div>
    </ModalComponent>
    <CreatePlaylistModal
        v-if="showCreatePlaylistModal"
        @close="showCreatePlaylistModal = false"
        @created="addCreatedPlaylist"
    />
</template>

<script>
import ModalComponent from "./ModalComponent.vue";
import CreatePlaylistModal from "./CreatePlaylistModal.vue";

export default {
    components: {
        ModalComponent,
        CreatePlaylistModal,
    },
    props: {
        videoInfo: {
            type: Object,
            required: true,
        },
        videoId: {
            type: String,
            required: true,
        },
    },
    emits: ["close"],
    data() {
        return {
            playlists: [],
            selectedPlaylist: null,
            processing: false,
            showCreatePlaylistModal: false,
        };
    },
    mounted() {
        this.getPlaylists().then(json => {
            this.playlists = json;
        });
        this.selectedPlaylist = this.getPreferenceString("selectedPlaylist" + this.hashCode(this.authApiUrl()));
        window.addEventListener("keydown", this.handleKeyDown);
        window.blur();
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
            if (event.code === "Enter" && !this.showCreatePlaylistModal) {
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

            this.addVideosToPlaylist(playlistId, [this.videoId], [this.videoInfo]).then(json => {
                this.setPreference("selectedPlaylist" + this.hashCode(this.authApiUrl()), playlistId);
                this.$emit("close");
                if (json.error) alert(json.error);
            });
        },
        addCreatedPlaylist(playlistId, playlistName) {
            this.playlists.push({ id: playlistId, name: playlistName });
            this.selectedPlaylist = playlistId;
        },
    },
};
</script>
