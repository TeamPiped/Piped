<template>
    <h1 class="uk-text-bold uk-text-center">Feed</h1>

    <small>You can import subscriptions from <router-link to="/import">here</router-link>.</small>

    <br />
    <router-link to="/subscriptions" class="uk-text-center">View Subscriptions</router-link>

    <br />
    Sort by:
    <select class="uk-select uk-width-auto" v-model="selectedSort" @change="onChange()">
        <option value="descending">Most Recent</option>
        <option value="ascending">Least Recent</option>
        <option value="channel_ascending">Channel Name (A-Z)</option>
        <option value="channel_descending">Channel Name (Z-A)</option>
    </select>

    <div class="uk-align-right">
        <a :href="getRssUrl"><font-awesome-icon icon="rss"></font-awesome-icon></a>
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
        this.fetchFeed().then(videos => {
            this.videos = videos;
            (async () => {
                if (window.db) {
                    var tx = window.db.transaction("watch_history", "readonly");
                    var store = tx.objectStore("watch_history");
                    const cursorRequest = store.openCursor();
                    cursorRequest.onsuccess = e => {
                        const cursor = e.target.result;
                        if (cursor) {
                            const video = this.videos.filter(
                                video => video.url.substr(-11) === cursor.value.videoId,
                            )[0];
                            if (video != null) {
                                video.watched = true;
                            }
                            cursor.continue();
                        }
                    };
                }
            })();
        });
    },
    activated() {
        document.title = "Feed - Piped";
    },
    methods: {
        async fetchFeed() {
            return await this.fetchJson(this.apiUrl() + "/feed", {
                authToken: this.getAuthToken(),
            });
        },
        onChange() {
            switch (this.selectedSort) {
                case "ascending":
                    this.videos.sort((a, b) => a.uploaded - b.uploaded);
                    break;
                case "descending":
                    this.videos.sort((a, b) => b.uploaded - a.uploaded);
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
    computed: {
        getRssUrl(_this) {
            return _this.apiUrl() + "/feed/rss?authToken=" + _this.getAuthToken();
        },
    },
    components: {
        VideoItem,
    },
};
</script>
