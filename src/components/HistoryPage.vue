<template>
    <h1 class="uk-text-bold uk-text-center">{{ $t("titles.history") }}</h1>

    <div style="text-align: left">
        <button class="uk-button" v-t="'actions.clear_history'" @click="clearHistory"></button>
    </div>

    <div style="text-align: right">
        <label for="ddlSortBy">{{ $t("actions.sort_by") }}</label>
        <select id="ddlSortBy" v-model="selectedSort" class="uk-select uk-width-auto" @change="onChange()">
            <option v-t="'actions.most_recent'" value="descending" />
            <option v-t="'actions.least_recent'" value="ascending" />
            <option v-t="'actions.channel_name_asc'" value="channel_ascending" />
            <option v-t="'actions.channel_name_desc'" value="channel_descending" />
        </select>
    </div>

    <hr />

    <div class="uk-grid uk-grid-xl">
        <div
            v-for="video in videos"
            :key="video.url"
            :style="[{ background: backgroundColor }]"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
        >
            <VideoItem :video="video" />
        </div>
    </div>

    <br />
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";

export default {
    components: {
        VideoItem,
    },
    data() {
        return {
            videos: [],
            selectedSort: "descending",
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
        onChange() {
            switch (this.selectedSort) {
                case "ascending":
                    this.videos.sort((a, b) => a.watchedAt - b.watchedAt);
                    break;
                case "descending":
                    this.videos.sort((a, b) => b.watchedAt - a.watchedAt);
                    break;
                case "channel_ascending":
                    this.videos.sort((a, b) => a.uploaderName.localeCompare(b.uploaderName));
                    break;
                case "channel_descending":
                    this.videos.sort((a, b) => b.uploaderName.localeCompare(a.uploaderName));
                    break;
            }
        },
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
