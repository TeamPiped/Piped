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
            <span class="uk-align-right@m">
                <select id="ddlSortBy" v-model="selectedSort" class="uk-select uk-width-auto" @change="onChange()">
                    <option v-t="'actions.most_recent'" value="descending" />
                    <option v-t="'actions.least_recent'" value="ascending" />
                    <option v-t="'actions.channel_name_asc'" value="channel_ascending" />
                    <option v-t="'actions.channel_name_desc'" value="channel_descending" />
                </select>
            </span>
        </div>
        <SearchSuggestions
            v-show="searchText && suggestionsVisible"
            ref="searchSuggestions"
            :search-text="searchText"
            @searchchange="onSearchTextChange"
        />

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
            class="uk-width-1-1 uk-width-1-3@s uk-width-1-4@m uk-width-1-4@l uk-width-1-5@xl"
        >
            <VideoItem :video="video" />
        </div>

        <div
            v-if="videos.length == 0 && !loading"
            class="uk-text-center"
            style="text-align: center; width: 100%; margin-top: 10%;"
        >
            <img width="210" src="/img/feed-no-video.png" />
            <h3 style="font-family: MontserratBold;">{{ $t("actions.no_videos_in_feed_title") }}</h3>
            <p class="uk-text-center" style="line-height: 21px;">
                {{ $t("actions.no_videos_in_feed_1") }}<br />
                {{ $t("actions.no_videos_in_feed_2") }}
            </p>
        </div>
    </div>
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";
import SearchSuggestions from "@/components/SearchSuggestions";

export default {
    components: {
        SearchSuggestions,
        VideoItem,
    },
    data() {
        return {
            currentVideoCount: 0,
            loading: true,
            videoStep: 100,
            videosStore: [],
            videos: [],
            selectedSort: "descending",
            searchText: "",
            suggestionsVisible: false,
        };
    },
    computed: {
        getRssUrl(_this) {
            return _this.apiUrl() + "/feed/rss?authToken=" + _this.getAuthToken();
        },
    },
    mounted() {
        this.fetchFeed().then(videos => {
            this.loading = false;
            this.videosStore = videos;
            this.loadMoreVideos();
            this.updateWatched(this.videos);
        });
    },
    activated() {
        document.title = this.$t("titles.feed") + " - Piped";
        if (this.videos.length > 0) this.updateWatched(this.videos);
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
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
