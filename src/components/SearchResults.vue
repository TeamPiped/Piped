<template>
    <div class="" style="padding: 34px 0">
        <div
            class="uk-search"
            :style="{
                width: '100%',
            }"
        >
            <div
                class="uk-position-relative"
                :style="{
                    float: isMobile ? 'none' : 'right',
                    width: isMobile ? '100%' : '35ch',
                }"
            >
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
                <SearchSuggestions
                    v-show="searchText && suggestionsVisible"
                    ref="searchSuggestions"
                    :search-text="searchText"
                    @searchchange="onSearchTextChange"
                />
            </div>
            <span
                class="uk-align-right@m"
                :style="{
                    float: isMobile ? 'none' : 'right',
                    marginRight: isMobile ? '0px' : '20px',
                }"
            >
                <select
                    id="ddlSearchFilters"
                    v-model="selectedFilter"
                    default="all"
                    class="uk-select uk-width-auto"
                    style="height: 100%"
                    @change="updateResults()"
                    :style="{
                        width: isMobile ? '100%' : 'auto',
                    }"
                >
                    <option v-for="filter in availableFilters" :key="filter" :value="filter">
                        {{ filter.replace("_", " ") }}
                    </option>
                </select>
            </span>
        </div>
    </div>

    <div v-if="results && results.corrected" style="height: 7vh">
        {{ $t("search.did_you_mean") }}
        <i>
            <router-link :to="{ name: 'SearchResults', query: { search_query: results.suggestion } }">
                {{ results.suggestion }}
            </router-link>
        </i>
    </div>

    <div v-if="results" class="uk-grid-xl" uk-grid="parallax: 0" style="padding-left: 25px;">
        <div
            v-for="result in results.items"
            :key="result.url"
            :style="[{ background: backgroundColor, paddingLeft: '15px' }]"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-4@l uk-width-1-5@xl"
        >
            <VideoItem v-if="shouldUseVideoItem(result)" :video="result" height="94" width="168" />
            <div v-if="!shouldUseVideoItem(result)" class="uk-text-secondary">
                <router-link class="uk-text-emphasis" :to="result.url">
                    <div class="uk-position-relative">
                        <img style="width: 100%" :src="result.thumbnail" loading="lazy" />
                    </div>
                    <p>
                        {{ result.name }}&thinsp;<font-awesome-icon
                            v-if="result.verified"
                            icon="check"
                        ></font-awesome-icon>
                    </p>
                </router-link>
                <p v-if="result.description">{{ result.description }}</p>
                <router-link v-if="result.uploaderUrl" class="uk-link-muted" :to="result.uploaderUrl">
                    <p>
                        {{ result.uploader }}&thinsp;<font-awesome-icon
                            v-if="result.uploaderVerified"
                            icon="check"
                        ></font-awesome-icon>
                    </p>
                </router-link>

                <a v-if="result.uploaderName" class="uk-text-muted">{{ result.uploaderName }}</a>
                <b v-if="result.videos >= 0"
                    ><br v-if="result.uploaderName" />{{ result.videos }} {{ $t("video.videos") }}</b
                >

                <br />
            </div>
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
            results: null,
            availableFilters: [
                "all",
                "videos",
                "channels",
                "playlists",
                "music_songs",
                "music_videos",
                "music_albums",
                "music_playlists",
            ],
            selectedFilter: "all",
            searchText: this.$route.query.search_query,
        };
    },
    mounted() {
        this.updateResults();
    },
    activated() {
        document.getElementsByTagName("main")[0].addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        document.getElementsByTagName("main")[0].removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        document.getElementsByTagName("main")[0].removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchResults() {
            return await await this.fetchJson(this.apiUrl() + "/search", {
                q: this.$route.query.search_query,
                filter: this.selectedFilter,
            });
        },
        async updateResults() {
            document.title = this.$route.query.search_query + " - Piped";
            this.results = this.fetchResults().then(json => (this.results = json));
        },
        handleScroll() {
            if (this.loading || !this.results || !this.results.nextpage) return;
            var mainElem = document.getElementsByTagName("main")[0];
            if (mainElem.offsetHeight + mainElem.scrollTop >= mainElem.scrollHeight - mainElem.clientHeight) {
                this.loading = true;
                this.fetchJson(this.apiUrl() + "/nextpage/search", {
                    nextpage: this.results.nextpage,
                    q: this.$route.query.search_query,
                    filter: this.selectedFilter,
                }).then(json => {
                    this.results.nextpage = json.nextpage;
                    this.results.id = json.id;
                    this.loading = false;
                    json.items.map(stream => this.results.items.push(stream));
                });
            }
        },
        shouldUseVideoItem(item) {
            return item.title;
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
