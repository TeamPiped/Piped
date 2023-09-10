<template>
    <hr />
    <div class="flex flex-wrap items-center place-content-between" style="gap: var(--efy_gap0)">
        <div class="flex" style="gap: var(--efy_gap0)">
            <button v-t="'actions.clear_history'" class="m-0" @click="clearHistory" />
            <button v-t="'actions.export_to_json'" class="m-0" @click="exportHistory" />
        </div>

        <div class="flex flex-wrap items-center" style="gap: var(--efy_gap0)">
            <div efy_select class="flex flex-wrap" style="gap: var(--efy_gap0)">
                <input id="autoDelete" v-model="autoDeleteHistory" type="checkbox" @change="onChange" />
                <label v-t="'actions.delete_automatically'" style="margin: 0" for="autoDelete" />
                <select
                    v-model="autoDeleteDelayHours"
                    class="w-auto"
                    style="margin: 0 var(--efy_gap0) 0 0"
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
            <SortingSelector by-key="watchedAt" @apply="order => videos.sort(order)" style="gap: 0" />
        </div>
    </div>

    <hr />

    <div class="video-grid">
        <VideoItem v-for="video in videos" :key="video.url" :item="video" />
    </div>
</template>

<script>
import VideoItem from "./VideoItem.vue";
import SortingSelector from "./SortingSelector.vue";

export default {
    components: {
        VideoItem,
        SortingSelector,
    },
    data() {
        return {
            videos: [],
            autoDeleteHistory: false,
            autoDeleteDelayHours: "24",
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
                cursorRequest.onsuccess = e => {
                    const cursor = e.target.result;
                    if (cursor) {
                        const video = cursor.value;
                        if (this.videos.length < 1000) cursor.continue();
                        if (!this.shouldRemoveVideo(video)) {
                            this.videos.push({
                                url: "/watch?v=" + video.videoId,
                                title: video.title,
                                uploaderName: video.uploaderName,
                                uploaderUrl: video.uploaderUrl,
                                duration: video.duration,
                                thumbnail: video.thumbnail,
                                watchedAt: video.watchedAt,
                                watched: true,
                                currentTime: video.currentTime,
                            });
                        } else {
                            store.delete(video.videoId);
                        }
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
        exportHistory() {
            const dateStr = new Date().toISOString().split(".")[0];
            let json = {
                format: "Piped",
                version: 1,
                playlists: [
                    {
                        name: `Piped History ${dateStr}`,
                        type: "history",
                        visibility: "private",
                        videos: this.videos.map(video => "https://youtube.com" + video.url),
                    },
                ],
            };
            this.download(JSON.stringify(json), `piped_history_${dateStr}.json`, "application/json");
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
    },
};
</script>
