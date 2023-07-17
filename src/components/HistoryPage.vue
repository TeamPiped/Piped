<template>
    <h1 class="font-bold text-center" v-t="'titles.history'" />

    <div class="flex md:items-center gap-2 flex-col md:flex-row">
        <button class="btn" v-t="'actions.clear_history'" @click="clearHistory" />

        <button class="btn" v-t="'actions.export_to_json'" @click="exportHistory" />

        <div class="ml-auto flex gap-1 items-center">
            <SortingSelector by-key="watchedAt" @apply="order => videos.sort(order)" />
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
            currentVideoCount: 0,
            videoStep: 100,
            videosStore: [],
            videos: [],
        };
    },
    mounted() {
        (async () => {
            if (window.db && this.getPreferenceBoolean("watchHistory", false)) {
                var tx = window.db.transaction("watch_history", "readonly");
                var store = tx.objectStore("watch_history");
                const cursorRequest = store.index("watchedAt").openCursor(null, "prev");
                const cursorPromise = new Promise(resolve => {
                    cursorRequest.onsuccess = e => {
                        const cursor = e.target.result;
                        if (cursor) {
                            const video = cursor.value;
                            this.videosStore.push({
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
