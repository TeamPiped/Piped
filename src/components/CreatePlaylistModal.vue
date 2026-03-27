<template>
    <ModalComponent @close="$emit('close')">
        <div class="flex flex-col">
            <h2 v-t="'actions.create_playlist'" />
            <input
                ref="input"
                v-model="playlistName"
                type="text"
                class="mt-2 h-8 rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
            />
            <div class="mt-3 ml-auto flex w-min">
                <button
                    v-t="'actions.cancel'"
                    class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="$emit('close')"
                />
                <button
                    v-t="'actions.okay'"
                    class="ml-2 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="onCreatePlaylist"
                />
            </div>
        </div>
    </ModalComponent>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import ModalComponent from "./ModalComponent.vue";
import { createPlaylist } from "@/composables/usePlaylists.js";

const emit = defineEmits(["created", "close"]);

const playlistName = ref("");
const input = ref(null);

function handleKeyDown(event) {
    if (event.code === "Enter") {
        onCreatePlaylist();
        event.preventDefault();
    }
}

function onCreatePlaylist() {
    if (!playlistName.value) return;

    createPlaylist(playlistName.value).then(response => {
        if (response.error) alert(response.error);
        else {
            emit("created", response.playlistId, playlistName.value);
            emit("close");
        }
    });
}

onMounted(() => {
    input.value.focus();
    window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
});
</script>
