<template>
    <h1
        v-if="isMobile"
        v-t="'titles.trending'"
        style="margin-bottom: 0; padding-top: 34px; font-weight: bold;"
        class="uk-heading-small"
    />

    <div class="uk-flex uk-flex-middle uk-flex-between uk-flex-row-reverse" style="padding: 34px 0">
        <form
            class="uk-search"
            :style="{
                width: isMobile ? '100%' : '35ch',
            }"
        >
            <div class="uk-position-relative">
                <input
                    class="uk-search-input"
                    style="border-radius: 9999px; padding: 12px 18px 12px 40px;"
                    :style="{ backgroundColor: secondaryBackgroundColor }"
                    type="search"
                    :placeholder="$t('actions.search')"
                />
                <font-awesome-icon
                    icon="search"
                    style="position: absolute; x: 0px; y: 0px;"
                    class="uk-position-center-left uk-position-small"
                />
            </div>
        </form>

        <div
            v-if="!isMobile"
            class="uk-flex uk-flex-middle"
            style="gap: 16px; transition: transform 400ms; transform-origin: left;"
            :style="!menuCollapsed ? 'transform: scale(0);' : {}"
        >
            <img src="/img/pipedPlay.svg" style="height: 36px;" />
            <img src="/img/piped.svg" />
        </div>
    </div>

    <div class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            v-for="video in videos"
            :key="video.url"
            :style="[{ background: backgroundColor }]"
            class="uk-width-1-1 uk-width-1-2@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
        >
            <VideoItem :video="video" height="118" width="210" />
        </div>
    </div>
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";

import { useIsMobile } from "../store";

export default {
    components: {
        VideoItem,
    },
    props: {
        menuCollapsed: Boolean,
    },
    setup() {
        const isMobile = useIsMobile();
        return { isMobile };
    },
    data() {
        return {
            videos: [],
        };
    },
    mounted() {
        let region = this.getPreferenceString("region", "US");

        this.fetchTrending(region).then(videos => {
            this.videos = videos;
            this.updateWatched(this.videos);
        });
    },
    activated() {
        document.title = this.$t("titles.trending") + " - Piped";
        if (this.videos.length > 0) this.updateWatched(this.videos);
    },
    methods: {
        async fetchTrending(region) {
            return await this.fetchJson(this.apiUrl() + "/trending", {
                region: region || "US",
            });
        },
    },
};
</script>
