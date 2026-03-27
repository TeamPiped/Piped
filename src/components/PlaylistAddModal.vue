<template>
    <ModalComponent @close="$emit('close')">
        <span v-t="'actions.select_playlist'" class="inline-block w-max text-2xl" />
        <select
            v-model="selectedPlaylist"
            class="mt-3 h-8 w-full rounded-md bg-gray-300 px-2.5 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
        >
            <option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id" v-text="playlist.name" />
        </select>
        <div class="mt-3 flex w-full justify-between">
            <button
                ref="addButton"
                v-t="'actions.create_playlist'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="showCreatePlaylistModal = true"
            />
            <button
                ref="addButton"
                v-t="'actions.add_to_playlist'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
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
