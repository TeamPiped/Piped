<template>
    <h1 class="font-bold text-center" v-t="'titles.history'" />

    <div class="flex">
        <div>
            <button class="btn" v-t="'actions.clear_history'" @click="clearHistory" />
        </div>

        <div class="right-1">
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
            videos: [],
        };
    },
    mounted() {
        (async () => {
            if (window.db) {
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
                            uploaderUrl: video.uploaderUrl,
                            duration: video.duration,
                            thumbnail: video.thumbnail,
                            watchedAt: video.watchedAt,
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
