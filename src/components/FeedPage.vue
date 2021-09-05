<template>
    <h1 class="uk-text-bold uk-text-center" v-t="'titles.feed'" />

    <button
        v-if="authenticated"
        @click="exportHandler"
        class="uk-button uk-button-small"
        style="background: #222; margin-right: 0.5rem"
        type="button"
    >
        <router-link to="/subscriptions">
            Subscriptions
        </router-link>
    </button>

    <span>
        <a :href="getRssUrl"><font-awesome-icon icon="rss" style="padding-top: 0.2rem"></font-awesome-icon></a>
    </span>

    <span class="uk-align-right">
        <label for="ddlSortBy">{{ $t("actions.sort_by") }}</label>
        <select id="ddlSortBy" class="uk-select uk-width-auto" v-model="selectedSort" @change="onChange()">
            <option value="descending" v-t="'actions.most_recent'" />
            <option value="ascending" v-t="'actions.least_recent'" />
            <option value="channel_ascending" v-t="'actions.channel_name_asc'" />
            <option value="channel_descending" v-t="'actions.channel_name_desc'" />
        </select>
    </span>

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
            this.updateWatched(this.videos);
        });
    },
    activated() {
        document.title = this.$t("titles.feed") + " - Piped";
        if (this.videos.length > 0) this.updateWatched(this.videos);
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
