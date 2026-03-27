<template>
    <h2 v-t="'titles.playlists'" class="my-4 font-bold" />

    <div class="mb-3 flex justify-between">
        <button
            v-t="'actions.create_playlist'"
            class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            @click="showCreatePlaylistModal = true"
        />
        <div class="flex">
            <button
                v-if="playlists.length > 0"
                v-t="'actions.export_to_json'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="exportPlaylists"
            />
            <input
                id="fileSelector"
                ref="fileSelector"
                type="file"
                class="hidden"
                multiple="multiple"
                @change="importPlaylists"
            />
            <label
                v-t="'actions.import_from_json_csv'"
                for="fileSelector"
                class="ml-2 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            />
        </div>
    </div>

    <div
        class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
    >
        <div v-for="playlist in playlists" :key="playlist.id">
            <router-link :to="`/playlist?list=${playlist.id}`">
                <img class="w-full" :src="playlist.thumbnail" alt="thumbnail" />
                <div class="relative text-sm">
                    <span
                        class="absolute right-1.25 bottom-1.25 rounded-md bg-black/75 px-1.25 text-white"
                        v-text="`${playlist.videos} ${$t('video.videos')}`"
                    />
                </div>
                <p
                    style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                    class="my-2 flex overflow-hidden hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
                    :title="playlist.name"
                    v-text="playlist.name"
                />
            </router-link>
            <button
                v-t="'actions.edit_playlist'"
                class="inline-block size-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="showPlaylistEditModal(playlist)"
            />
            <button
                v-t="'actions.delete_playlist'"
                class="ml-2 inline-block size-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="playlistToDelete = playlist.id"
            />
            <ModalComponent v-if="playlist.id == playlistToEdit" @close="playlistToEdit = null">
                <div class="flex flex-col gap-2">
                    <h2 v-t="'actions.edit_playlist'" />
                    <input
                        v-model="newPlaylistName"
                        class="h-8 rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                        type="text"
                        :placeholder="$t('actions.playlist_name')"
                    />
                    <input
                        v-model="newPlaylistDescription"
                        class="h-8 rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                        type="text"
                        :placeholder="$t('actions.playlist_description')"
                    />
                    <button
                        v-t="'actions.okay'"
                        class="ml-auto inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                        @click="editPlaylist(playlist)"
                    />
                </div>
            </ModalComponent>
            <ConfirmModal
                v-if="playlistToDelete == playlist.id"
                :message="$t('actions.delete_playlist_confirm')"
                @close="playlistToDelete = null"
                @confirm="onDeletePlaylist(playlist.id)"
            />
        </div>
    </div>
    <hr />

    <h2 v-t="'titles.bookmarks'" class="my-4 font-bold" />

    <div
        v-if="bookmarks"
        class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
    >
        <router-link
            v-for="(playlist, index) in bookmarks"
            :key="playlist.playlistId"
            :to="`/playlist?list=${playlist.playlistId}`"
        >
            <img class="w-full" :src="playlist.thumbnail" alt="thumbnail" />
            <div class="relative text-sm">
                <span
                    class="absolute right-1.25 bottom-1.25 rounded-md bg-black/75 px-1.25 text-white"
                    v-text="`${playlist.videos} ${$t('video.videos')}`"
                />
                <div class="absolute right-1.25 bottom-25 z-100 px-1.25" @click.prevent="removeBookmark(index)">
                    <i-fa6-solid-bookmark class="ml-3" />
                </div>
            </div>
            <p
                style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                class="my-2 flex overflow-hidden hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
                :title="playlist.name"
                v-text="playlist.name"
            />
            <a :href="playlist.uploaderUrl" class="flex items-center">
                <img class="size-8 rounded-full" :src="playlist.uploaderAvatar" />
                <span class="ml-3 hover:underline" v-text="playlist.uploader" />
            </a>
        </router-link>
    </div>
    <br />
    <CreatePlaylistModal
        v-if="showCreatePlaylistModal"
        @close="showCreatePlaylistModal = false"
        @created="fetchPlaylistsList"
    />
</template>

<script setup>
import { ref, onMounted, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import ConfirmModal from "./ConfirmModal.vue";
import ModalComponent from "./ModalComponent.vue";
import CreatePlaylistModal from "./CreatePlaylistModal.vue";
import {
    getPlaylists,
    getPlaylist,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    changePlaylistDescription,
    addVideosToPlaylist,
} from "@/composables/usePlaylists.js";
import { download } from "@/composables/useMisc.js";

const { t } = useI18n();

const fileSelector = ref(null);
const playlists = ref([]);
const bookmarks = ref([]);
const playlistToDelete = ref(null);
const playlistToEdit = ref(null);
const newPlaylistName = ref("");
const newPlaylistDescription = ref("");
const showCreatePlaylistModal = ref(false);

function fetchPlaylistsList() {
    getPlaylists().then(json => {
        playlists.value = json;
    });
}

function showPlaylistEditModal(playlist) {
    newPlaylistName.value = playlist.name;
    newPlaylistDescription.value = playlist.description;
    playlistToEdit.value = playlist.id;
}

function editPlaylist(selectedPlaylist) {
    const newName = newPlaylistName.value;
    const newDescription = newPlaylistDescription.value;
    if (newName != selectedPlaylist.name) {
        renamePlaylist(selectedPlaylist.id, newName).then(json => {
            if (json.error) alert(json.error);
            else selectedPlaylist.name = newName;
        });
    }
    if (newDescription != selectedPlaylist.description) {
        changePlaylistDescription(selectedPlaylist.id, newDescription).then(json => {
            if (json.error) alert(json.error);
            else selectedPlaylist.description = newDescription;
        });
    }
    playlistToEdit.value = null;
}

function onDeletePlaylist(id) {
    deletePlaylist(id).then(json => {
        if (json.error) alert(json.error);
        else playlists.value = playlists.value.filter(playlist => playlist.id !== id);
    });
    playlistToDelete.value = null;
}

async function exportPlaylists() {
    if (!playlists.value) return;
    let json = {
        format: "Piped",
        version: 1,
        playlists: [],
    };
    let tasks = playlists.value.map(playlist => fetchPlaylistJson(playlist.id));
    json.playlists = await Promise.all(tasks);
    download(JSON.stringify(json), "playlists.json", "application/json");
}

async function fetchPlaylistJson(playlistId) {
    let playlist = await getPlaylist(playlistId);
    return {
        name: playlist.name,
        type: "playlist",
        visibility: "private",
        videos: playlist.relatedStreams.map(stream => "https://youtube.com" + stream.url),
    };
}

async function importPlaylists() {
    const files = fileSelector.value.files;
    for (let file of files) {
        await importPlaylistFile(file);
    }
    window.location.reload();
}

async function importPlaylistFile(file) {
    let text = (await file.text()).trim();
    let tasks = [];
    if (file.name.slice(-4).toLowerCase() == ".csv") {
        const lines = text.split("\n");

        const playlistInfo = lines[1].split(",");
        let videoListStartIndex = 0;
        let playlistName = null;
        if (playlistInfo.length > 2) {
            playlistName = playlistInfo[4];
            videoListStartIndex = 4;
        }

        const playlist = {
            name: playlistName ?? file.name.replace(".csv", ""),
            videos: lines
                .slice(videoListStartIndex, lines.length)
                .filter(line => line != "")
                .slice(1)
                .map(line => `https://youtube.com/watch?v=${line.split(",")[0]}`),
        };
        tasks.push(createPlaylistWithVideos(playlist));
    } else if (text.includes('"Piped"')) {
        let parsedPlaylists = JSON.parse(text).playlists;
        if (!parsedPlaylists.length) {
            alert(t("actions.no_valid_playlists"));
            return;
        }
        for (let playlist of parsedPlaylists) {
            tasks.push(createPlaylistWithVideos(playlist));
        }
    } else {
        alert(t("actions.no_valid_playlists"));
        return;
    }
    await Promise.all(tasks);
}

async function createPlaylistWithVideos(playlist) {
    let newPlaylist = await createPlaylist(playlist.name);
    let videoIds = playlist.videos.map(url => url.substr(-11));
    await addVideosToPlaylist(newPlaylist.playlistId, videoIds);
}

async function loadPlaylistBookmarks() {
    if (!window.db) return;
    var tx = window.db.transaction("playlist_bookmarks", "readonly");
    var store = tx.objectStore("playlist_bookmarks");
    const cursorRequest = store.openCursor();
    cursorRequest.onsuccess = e => {
        const cursor = e.target.result;
        if (cursor) {
            bookmarks.value.push(cursor.value);
            cursor.continue();
        }
    };
}

async function removeBookmark(index) {
    var tx = window.db.transaction("playlist_bookmarks", "readwrite");
    var store = tx.objectStore("playlist_bookmarks");
    store.delete(bookmarks.value[index].playlistId);
    bookmarks.value.splice(index, 1);
}

onMounted(() => {
    fetchPlaylistsList();
    loadPlaylistBookmarks();
});

onActivated(() => {
    document.title = t("titles.playlists") + " - Piped";
});
</script>
