<template>
    <h1 class="text-center my-2" v-text="$route.query.search_query" />

    <label for="ddlSearchFilters">
        <strong v-text="`${$t('actions.filter')}:`" />
    </label>
    <select id="ddlSearchFilters" v-model="selectedFilter" default="all" class="select w-auto" @change="updateFilter()">
        <option v-for="filter in availableFilters" :key="filter" :value="filter" v-t="`search.${filter}`" />
    </select>

    <hr />

    <div v-if="results && results.corrected">
        <i18n-t keypath="search.did_you_mean" tag="div" class="text-lg">
            <router-link :to="{ name: 'SearchResults', query: { search_query: results.suggestion } }">
                <em v-text="results.suggestion" />
            </router-link>
        </i18n-t>
    </div>

    <div v-if="results" class="video-grid">
        <template v-for="result in results.items" :key="result.url">
            <ContentItem :item="result" height="94" width="168" />
        </template>
    </div>
</template>

<script>
import ContentItem from "./ContentItem.vue";

export default {
    components: {
        ContentItem,
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
            selectedFilter: this.$route.query.filter ?? "all",
        };
    },
    mounted() {
        if (this.handleRedirect()) return;
        this.updateResults();
        this.saveQueryToHistory();
    },
    activated() {
        this.handleRedirect();
        window.addEventListener("scroll", this.handleScroll);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchResults() {
            return await await this.fetchJson(this.apiUrl() + "/search", {
                q: this.$route.query.search_query,
                filter: this.$route.query.filter ?? "all",
            });
        },
        async updateResults() {
            document.title = this.$route.query.search_query + " - Piped";
            this.results = this.fetchResults().then(json => (this.results = json));
        },
        updateFilter() {
            this.$router.replace({
                query: {
                    search_query: this.$route.query.search_query,
                    filter: this.selectedFilter,
                },
            });
        },
        handleScroll() {
            if (this.loading || !this.results || !this.results.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.apiUrl() + "/nextpage/search", {
                    nextpage: this.results.nextpage,
                    q: this.$route.query.search_query,
                    filter: this.$route.query.filter ?? "all",
                }).then(json => {
                    this.results.nextpage = json.nextpage;
                    this.results.id = json.id;
                    this.loading = false;
                    json.items.map(stream => this.results.items.push(stream));
                });
            }
        },
        handleRedirect() {
            const query = this.$route.query.search_query;
            const url =
                /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm.exec(query)?.[1] ??
                /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm
                    .exec(query)?.[1]
                    .replace(/^/, "/watch?v=");
            if (url) {
                this.$router.push(url);
                return true;
            }
        },
        saveQueryToHistory() {
            if (!this.getPreferenceBoolean("searchHistory", false)) return;
            const query = this.$route.query.search_query;
            if (!query) return;
            const searchHistory = JSON.parse(localStorage.getItem("search_history")) ?? [];
            if (searchHistory.includes(query)) {
                const index = searchHistory.indexOf(query);
                searchHistory.splice(index, 1);
            }
            searchHistory.unshift(query);
            if (searchHistory.length > 10) searchHistory.shift();
            localStorage.setItem("search_history", JSON.stringify(searchHistory));
        },
    },
};
</script>
