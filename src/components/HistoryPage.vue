<template>
    <h1 v-t="'titles.history'" class="my-2 mb-3 text-center font-bold" />

    <div class="flex justify-between">
        <div class="flex flex-col gap-2 md:flex-row md:items-center">
            <button
                v-t="'actions.clear_history'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="clearHistory"
            />

            <button
                v-t="'actions.export_history'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="showExportModal = !showExportModal"
            />
            <button
                v-t="'actions.import_history'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="showImportModal = !showImportModal"
            />
        </div>

        <div class="flex items-center gap-1">
            <SortingSelector by-key="watchedAt" @apply="order => videos.sort(order)" />
        </div>

        <div class="ml-4 flex items-center">
            <input id="autoDelete" v-model="autoDeleteHistory" type="checkbox" @change="onChange" />
            <label v-t="'actions.delete_automatically'" class="ml-2" for="autoDelete" />
            <select
                v-model="autoDeleteDelayHours"
                class="ml-3 h-8 rounded-md bg-gray-300 pl-3 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
                @change="onChange"
            >
                <option v-t="{ path: 'info.hours', args: { amount: '1' } }" value="1" />
                <option v-t="{ path: 'info.hours', args: { amount: '3' } }" value="3" />
                <option v-t="{ path: 'info.hours', args: { amount: '6' } }" value="6" />
                <option v-t="{ path: 'info.hours', args: { amount: '12' } }" value="12" />
                <option v-t="{ path: 'info.days', args: { amount: '1' } }" value="24" />
                <option v-t="{ path: 'info.days', args: { amount: '3' } }" value="72" />
                <option v-t="{ path: 'info.weeks', args: { amount: '1' } }" value="168" />
                <option v-t="{ path: 'info.weeks', args: { amount: '3' } }" value="336" />
                <option v-t="{ path: 'info.months', args: { amount: '1' } }" value="672" />
                <option v-t="{ path: 'info.months', args: { amount: '2' } }" value="1344" />
            </select>
        </div>
    </div>

    <hr />

    <div
        class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
    >
        <VideoItem v-for="video in videos" :key="video.url" :item="video" />
    </div>

    <br />
    <ExportHistoryModal v-if="showExportModal" @close="showExportModal = false" />
    <ImportHistoryModal v-if="showImportModal" @close="showImportModal = false" />
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated } from "vue";
import VideoItem from "./VideoItem.vue";
import SortingSelector from "./SortingSelector.vue";
import ExportHistoryModal from "./ExportHistoryModal.vue";
import ImportHistoryModal from "./ImportHistoryModal.vue";
import { getPreferenceBoolean, getPreferenceString, setPreference } from "@/composables/usePreferences.js";

let currentVideoCount = 0;
const videoStep = 100;
const videosStore = [];
const videos = ref([]);
const autoDeleteHistory = ref(false);
const autoDeleteDelayHours = ref("24");
const showExportModal = ref(false);
const showImportModal = ref(false);

function shouldRemoveVideo(video) {
    if (!autoDeleteHistory.value) return false;
    let maximumTimeDiff = Number(autoDeleteDelayHours.value) * 60 * 60 * 1000;
    return Date.now() - video.watchedAt > maximumTimeDiff;
}

function loadMoreVideos() {
    currentVideoCount = Math.min(currentVideoCount + videoStep, videosStore.length);
    if (videos.value.length != videosStore.length) videos.value = videosStore.slice(0, currentVideoCount);
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
        loadMoreVideos();
    }
}

function clearHistory() {
    if (window.db) {
        var tx = window.db.transaction("watch_history", "readwrite");
        var store = tx.objectStore("watch_history");
        store.clear();
    }
    videos.value = [];
}

function onChange() {
    setPreference("autoDeleteWatchHistory", autoDeleteHistory.value);
    setPreference("autoDeleteWatchHistoryDelayHours", autoDeleteDelayHours.value);
}

onMounted(() => {
    autoDeleteHistory.value = getPreferenceBoolean("autoDeleteWatchHistory", false);
    autoDeleteDelayHours.value = getPreferenceString("autoDeleteWatchHistoryDelayHours", "24");

    (async () => {
        if (window.db && getPreferenceBoolean("watchHistory", false)) {
            var tx = window.db.transaction("watch_history", "readwrite");
            var store = tx.objectStore("watch_history");
            const cursorRequest = store.index("watchedAt").openCursor(null, "prev");
            const cursorPromise = new Promise(resolve => {
                cursorRequest.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        const video = cursor.value;
                        if (!shouldRemoveVideo(video)) {
                            videosStore.push({
                                url: "/watch?v=" + video.videoId,
                                title: video.title,
                                uploaderName: video.uploaderName,
                                uploaderUrl: video.uploaderUrl ?? "",
                                duration: video.duration ?? 0,
                                thumbnail: video.thumbnail,
                                watchedAt: video.watchedAt,
                                watched: true,
                                currentTime: video.currentTime,
                            });
                        } else {
                            store.delete(video.videoId);
                        }
                        if (videosStore.length < 1000) cursor.continue();
                        else resolve();
                    } else resolve();
                };
            });
            await cursorPromise;
        }
    })().then(() => {
        loadMoreVideos();
    });
});

onActivated(() => {
    document.title = "Watch History - Piped";
    window.addEventListener("scroll", handleScroll);
});

onDeactivated(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>
