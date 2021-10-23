<template>
    <h1
        v-if="isMobile"
        v-t="'titles.trending'"
        style="margin-bottom: 0; padding-top: 34px; font-weight: bold;"
        class="uk-heading-small"
    />

    <div class="uk-flex uk-flex-middle uk-flex-between uk-flex-row-reverse" style="padding: 34px 0">
        <div
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
                    v-model="searchText"
                    type="text"
                    role="search"
                    :title="$t('actions.search')"
                    :placeholder="$t('actions.search')"
                    @keyup="onKeyUp"
                    @focus="onInputFocus"
                    @blur="onInputBlur"
                />
                <font-awesome-icon
                    icon="search"
                    style="position: absolute; x: 0px; y: 0px;"
                    class="uk-position-center-left uk-position-small"
                />
            </div>
            <SearchSuggestions
                v-show="searchText && suggestionsVisible"
                ref="searchSuggestions"
                :search-text="searchText"
                @searchchange="onSearchTextChange"
            />
        </div>

        <div
            v-if="!isMobile"
            class="uk-flex uk-flex-middle"
            style="gap: 16px; transition: transform 400ms; transform-origin: left;"
            :style="!menuCollapsed ? 'transform: scale3d(0, 0, 0);' : {}"
        >
            <img src="/img/pipedPlay.svg" style="height: 36px;" />
            <img src="/img/piped.svg" />
        </div>
    </div>

    <div class="uk-grid-xl" uk-grid="parallax: 0" style="padding-left: 25px;">
        <div
            v-for="video in videos"
            :key="video.url"
            :style="[{ background: backgroundColor, paddingLeft: '15px' }]"
            class="uk-width-1-1 uk-width-1-2@s uk-width-1-4@m uk-width-1-4@l uk-width-1-5@xl"
        >
            <VideoItem :video="video" height="118" width="210" />
        </div>
    </div>
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";
import SearchSuggestions from "@/components/SearchSuggestions";

import { useIsMobile } from "../store";

export default {
    components: {
        SearchSuggestions,
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
            searchText: "",
            suggestionsVisible: false,
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

        onKeyUp(e) {
            if (e.key === "Enter") {
                e.target.blur();
                this.$router.push({
                    name: "SearchResults",
                    query: { search_query: this.searchText },
                });
                return;
            } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
            }
            this.$refs.searchSuggestions.onKeyUp(e);
        },
        onInputFocus() {
            this.suggestionsVisible = true;
        },
        onInputBlur() {
            this.suggestionsVisible = false;
        },
        onSearchTextChange(searchText) {
            this.searchText = searchText;
        },
    },
};
</script>
