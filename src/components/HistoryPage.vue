<template>
    <h1 v-t="'titles.history'" class="my-2 mb-3 text-center font-bold" />

    <div class="flex justify-between">
        <div class="flex flex-col gap-2 md:flex-row md:items-center">
            <button v-t="'actions.clear_history'" class="btn" @click="clearHistory" />

            <button v-t="'actions.export_history'" class="btn" @click="showExportModal = !showExportModal" />
            <button v-t="'actions.import_history'" class="btn" @click="showImportModal = !showImportModal" />
        </div>

        <div class="flex items-center gap-1">
            <SortingSelector by-key="watchedAt" @apply="order => videos.sort(order)" />
        </div>

        <div class="ml-4 flex items-center">
            <input id="autoDelete" v-model="autoDeleteHistory" type="checkbox" @change="onChange" />
            <label v-t="'actions.delete_automatically'" class="ml-2" for="autoDelete" />
            <select v-model="autoDeleteDelayHours" class="select ml-3 pl-3" @change="onChange">
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
            currentVideoCount: 0,
            videoStep: 100,
            videosStore: [],
            videos: [],
            autoDeleteHistory: false,
            autoDeleteDelayHours: "24",
            showExportModal: false,
            showImportModal: false,
        };
    },
    mounted() {
        this.autoDeleteHistory = this.getPreferenceBoolean("autoDeleteWatchHistory", false);
        this.autoDeleteDelayHours = this.getPreferenceString("autoDeleteWatchHistoryDelayHours", "24");

        (async () => {
            if (window.db && this.getPreferenceBoolean("watchHistory", false)) {
                var tx = window.db.transaction("watch_history", "readwrite");
                var store = tx.objectStore("watch_history");
                const cursorRequest = store.index("watchedAt").openCursor(null, "prev");
                const cursorPromise = new Promise(resolve => {
                    cursorRequest.onsuccess = e => {
                        const cursor = e.target.result;
                        if (cursor) {
                            const video = cursor.value;
                            if (!this.shouldRemoveVideo(video)) {
                                this.videosStore.push({
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
                            } else {
                                store.delete(video.videoId);
                            }
                            if (this.videosStore.length < 1000) cursor.continue();
                            else resolve();
                        } else resolve();
                    };
                });
                await cursorPromise;
            }
        })().then(() => {
            this.loadMoreVideos();
        });
    },
    activated() {
        document.title = "Watch History - Piped";
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
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
        onChange() {
            this.setPreference("autoDeleteWatchHistory", this.autoDeleteHistory);
            this.setPreference("autoDeleteWatchHistoryDelayHours", this.autoDeleteDelayHours);
        },
        shouldRemoveVideo(video) {
            if (!this.autoDeleteHistory) return false;
            // convert from hours to milliseconds
            let maximumTimeDiff = Number(this.autoDeleteDelayHours) * 60 * 60 * 1000;
            return Date.now() - video.watchedAt > maximumTimeDiff;
        },
        loadMoreVideos() {
            this.currentVideoCount = Math.min(this.currentVideoCount + this.videoStep, this.videosStore.length);
            if (this.videos.length != this.videosStore.length)
                this.videos = this.videosStore.slice(0, this.currentVideoCount);
        },
        handleScroll() {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loadMoreVideos();
            }
        },
    },
};
</script>
