<template>
    <h1 class="uk-text-bold uk-text-center">Watch History</h1>


    <div style="text-align: right">
        <label for="ddlSortBy">{{ $t("actions.sort_by") }}</label>
        <select id="ddlSortBy" class="uk-select uk-width-auto" v-model="selectedSort" @change="onChange()">
            <option value="descending" v-t="'actions.most_recent'" />
            <option value="ascending" v-t="'actions.least_recent'" />
            <option value="channel_ascending" v-t="'actions.channel_name_asc'" />
            <option value="channel_descending" v-t="'actions.channel_name_desc'" />
        </select>
    </div>

    <hr />

    <div class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            :style="[{ background: backgroundColor }]"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="video.url"
            v-for="video in videos"
        >
            <VideoItem :video="video" />
        </div>
    </div>

    <br />
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";

export default {
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
    },
    components: {
        VideoItem,
    },
};
</script>
