<template>
    <ModalComponent>
        <span class="text-2xl w-max inline-block" v-t="'actions.select_playlist'" />
        <select class="select w-full mt-3" v-model="selectedPlaylist">
            <option v-for="playlist in playlists" :value="playlist.id" :key="playlist.id" v-text="playlist.name" />
        </select>
        <div class="flex justify-between w-full mt-3">
            <button class="btn" @click="onCreatePlaylist" ref="addButton" v-t="'actions.create_playlist'" />
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
        videoInfo: {
            type: Object,
            required: true,
        },
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

            this.addVideosToPlaylist(playlistId, [this.videoId], [this.videoInfo]).then(json => {
                this.setPreference("selectedPlaylist" + this.hashCode(this.authApiUrl()), playlistId);
                this.$emit("close");
                if (json.error) alert(json.error);
            });
        },
        async fetchPlaylists() {
            this.getPlaylists().then(json => {
                this.playlists = json;
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
    },
};
</script>
