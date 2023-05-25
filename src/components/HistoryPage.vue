<template>
    <h1 class="font-bold text-center my-2" v-t="'titles.history'" />

    <div class="flex flex-col gap-2 items-center lg:flex-row">
        <div class="flex flex-wrap gap-2 justify-center">
            <button class="btn w-54" v-t="'actions.clear_history'" @click="clearHistory" />

            <button class="btn w-54" v-t="'actions.export_to_json'" @click="showExportModal = !showExportModal" />

            <button class="btn w-54" v-t="'actions.import_from_json'" @click="showImportModal = !showImportModal" />
        </div>

        <div class="lg:right-1">
            <SortingSelector by-key="watchedAt" @apply="order => videos.sort(order)" />
        </div>
    </div>

    <hr />

    <div class="video-grid">
        <VideoItem v-for="video in videos" :key="video.url" :item="video" />
    </div>

    <br />
    <ExportHistoryModal v-if="showExportModal" @close="showExportModal = false" />
    <ImportHistoryModal v-if="showImportModal" @close="showImportModal = false" />
</template>

<script>
import VideoItem from "./VideoItem.vue";
import SortingSelector from "./SortingSelector.vue";
import ExportHistoryModal from "./ExportHistoryModal.vue";
import ImportHistoryModal from "./ImportHistoryModal.vue";

export default {
    components: {
        VideoItem,
        SortingSelector,
        ExportHistoryModal,
        ImportHistoryModal,
    },
    data() {
        return {
            videos: [],
            showExportModal: false,
            showImportModal: false,
        };
    },
    mounted() {
        (async () => {
            if (window.db && this.getPreferenceBoolean("watchHistory", false)) {
                var tx = window.db.transaction("watch_history", "readonly");
                var store = tx.objectStore("watch_history");
                const cursorRequest = store.index("watchedAt").openCursor(null, "prev");
                cursorRequest.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        const video = cursor.value;
                        this.videos.push({
                            url: "/watch?v=" + video.videoId,
                            title: video.title,
                            uploaderName: video.uploaderName,
                            uploaderUrl: video.uploaderUrl ?? "", // Router doesn't like undefined
                            duration: video.duration ?? 0, // Undefined duration shows "Live"
                            thumbnail: video.thumbnail,
                            watchedAt: video.watchedAt,
                            watched: true,
                            currentTime: video.currentTime,
                        });
                        if (this.videos.length < 1000) cursor.continue();
                    }
                };
            }
        })();
    },
    activated() {
        document.title = "Watch History - Piped";
    },
    methods: {
        clearHistory() {
            if (window.db) {
                var tx = window.db.transaction("watch_history", "readwrite");
                var store = tx.objectStore("watch_history");
                store.clear();
            }
            this.videos = [];
        },
    },
};
</script>
