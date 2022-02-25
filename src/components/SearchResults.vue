<template>
    <h1 class="text-center" v-text="$route.query.search_query" />

    <label for="ddlSearchFilters">
        <strong v-text="`${$t('actions.filter')}:`" />
    </label>
    <select
        id="ddlSearchFilters"
        v-model="selectedFilter"
        default="all"
        class="select w-auto"
        @change="updateResults()"
    >
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
            <VideoItem v-if="shouldUseVideoItem(result)" :video="result" height="94" width="168" />
            <div v-if="!shouldUseVideoItem(result)">
                <router-link :to="result.url">
                    <div class="relative">
                        <img class="w-full" :src="result.thumbnail" loading="lazy" />
                    </div>
                    <p>
                        <span v-text="result.name" />
                        <font-awesome-icon class="ml-1.5" v-if="result.verified" icon="check" />
                    </p>
                </router-link>
                <p v-if="result.description" v-text="result.description" />
                <router-link v-if="result.uploaderUrl" class="link" :to="result.uploaderUrl">
                    <p>
                        <span v-text="result.uploader" />
                        <font-awesome-icon class="ml-1.5" v-if="result.uploaderVerified" icon="check" />
                    </p>
                </router-link>

                <a v-if="result.uploaderName" class="link" v-text="result.uploaderName" />
                <template v-if="result.videos >= 0">
                    <br v-if="result.uploaderName" />
                    <strong v-text="`${result.videos} ${$t('video.videos')}`" />
                </template>

                <br />
            </div>
        </template>
    </div>
</template>

<script>
import VideoItem from "@/components/VideoItem.vue";

export default {
    components: {
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
        };
    },
    mounted() {
        if (this.handleRedirect()) return;
        this.updateResults();
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
                filter: this.selectedFilter,
            });
        },
        async updateResults() {
            document.title = this.$route.query.search_query + " - Piped";
            this.results = this.fetchResults().then(json => (this.results = json));
        },
        handleScroll() {
            if (this.loading || !this.results || !this.results.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
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
        handleRedirect() {
            const query = this.$route.query.search_query;
            const url =
                /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9?=&]*)/gm.exec(query)?.[1] ??
                /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9?=&]*)/gm
                    .exec(query)?.[1]
                    .replace(/^/, "/watch?v=");
            if (url) {
                this.$router.push(url);
                return true;
            }
        },
    },
};
</script>
