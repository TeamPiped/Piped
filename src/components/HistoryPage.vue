<template>
    <h1 class="font-bold text-center" v-t="'titles.history'" />

    <div class="flex">
        <div>
            <button class="btn" v-t="'actions.clear_history'" @click="clearHistory" />
        </div>

        <div class="right-1">
            <Sorting by-key="watchedAt" @apply="order => videos.sort(order)" />
        </div>
    </div>

    <hr />

    <div class="video-grid">
        <VideoItem v-for="video in videos" :key="video.url" :video="video" />
    </div>

    <br />
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";
import Sorting from "@/components/Sorting.vue";

export default {
    components: {
        VideoItem,
        Sorting,
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
                const cursorRequest = store.openCursor();
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
                        this.videos.sort((a, b) => b.watchedAt - a.watchedAt); // TODO: Optimize
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
