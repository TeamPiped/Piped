<template>
    <h1 class="font-bold text-center mb-3" v-t="'titles.history'" />

    <div class="flex">
        <div class="flex md:items-center gap-2 flex-col md:flex-row">
            <button class="btn" v-t="'actions.clear_history'" @click="clearHistory" />

            <button class="btn" v-t="'actions.export_to_json'" @click="exportHistory" />

            <div class="ml-auto flex gap-1 items-center">
                <SortingSelector by-key="watchedAt" @apply="order => videos.sort(order)" />
            </div>
        </div>

        <div class="flex ml-4 items-center">
            <input id="autoDelete" type="checkbox" v-model="autoDeleteHistory" @change="onChange" />
            <label class="ml-2" for="autoDelete" v-t="'actions.delete_automatically'" />
            <select class="pl-3 ml-3 select" v-model="autoDeleteDelayHours" @change="onChange">
                <option value="1" v-t="{ path: 'info.hours', args: { amount: '1' } }" />
                <option value="3" v-t="{ path: 'info.hours', args: { amount: '3' } }" />
                <option value="6" v-t="{ path: 'info.hours', args: { amount: '6' } }" />
                <option value="12" v-t="{ path: 'info.hours', args: { amount: '12' } }" />
                <option value="24" v-t="{ path: 'info.days', args: { amount: '1' } }" />
                <option value="72" v-t="{ path: 'info.days', args: { amount: '3' } }" />
                <option value="168" v-t="{ path: 'info.weeks', args: { amount: '1' } }" />
                <option value="336" v-t="{ path: 'info.weeks', args: { amount: '3' } }" />
                <option value="672" v-t="{ path: 'info.months', args: { amount: '1' } }" />
                <option value="1344" v-t="{ path: 'info.months', args: { amount: '2' } }" />
            </select>
        </div>
    </div>

    <hr />

    <div class="video-grid">
        <VideoItem v-for="video in videos" :key="video.url" :item="video" />
    </div>

    <br />
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
