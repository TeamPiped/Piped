<template>
    <ModalComponent @close="$emit('close')">
        <span v-t="'actions.select_playlist'" class="inline-block w-max text-2xl" />
        <select v-model="selectedPlaylist" class="select mt-3 w-full">
            <option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id" v-text="playlist.name" />
        </select>
        <div class="mt-3 w-full flex justify-between">
            <button
                ref="addButton"
                v-t="'actions.create_playlist'"
                class="btn"
                @click="showCreatePlaylistModal = true"
            />
            <button
                ref="addButton"
                v-t="'actions.add_to_playlist'"
                class="btn"
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

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import ModalComponent from "./ModalComponent.vue";
import CreatePlaylistModal from "./CreatePlaylistModal.vue";
import { getPlaylists, addVideosToPlaylist } from "@/composables/usePlaylists.js";
import { getPreferenceString, setPreference } from "@/composables/usePreferences.js";
import { authApiUrl, hashCode } from "@/composables/useApi.js";

const { t } = useI18n();

const props = defineProps({
    videoInfo: {
        type: Object,
        required: true,
    },
    videoId: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(["close"]);

const addButton = ref(null);
const playlists = ref([]);
const selectedPlaylist = ref(null);
const processing = ref(false);
const showCreatePlaylistModal = ref(false);

function handleKeyDown(event) {
    if (event.code === "Enter" && !showCreatePlaylistModal.value) {
        handleClick(selectedPlaylist.value);
        event.preventDefault();
    }
}

function handleClick(playlistId) {
    if (!playlistId) {
        alert(t("actions.please_select_playlist"));
        return;
    }

    if (processing.value) return;

    addButton.value.disabled = true;
    processing.value = true;

    addVideosToPlaylist(playlistId, [props.videoId], [props.videoInfo]).then(json => {
        setPreference("selectedPlaylist" + hashCode(authApiUrl()), playlistId);
        emit("close");
        if (json.error) alert(json.error);
    });
}

function addCreatedPlaylist(playlistId, playlistName) {
    playlists.value.push({ id: playlistId, name: playlistName });
    selectedPlaylist.value = playlistId;
}

onMounted(() => {
    getPlaylists().then(json => {
        playlists.value = json;
    });
    selectedPlaylist.value = getPreferenceString("selectedPlaylist" + hashCode(authApiUrl()));
    window.addEventListener("keydown", handleKeyDown);
    window.blur();
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
});
</script>
