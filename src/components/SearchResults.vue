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
        style="height: 100%"
        @change="updateResults()"
    >
        <option v-for="filter in availableFilters" :key="filter" :value="filter" v-text="filter.replace('_', ' ')" />
    </select>

    <hr />

    <div v-if="results && results.corrected" style="height: 7vh">
        <span v-text="$t('search.did_you_mean')" />
        <em>
            <router-link
                :to="{ name: 'SearchResults', query: { search_query: results.suggestion } }"
                v-text="results.suggestion"
            />
        </em>
    </div>

    <div v-if="results" class="video-grid">
        <div v-for="result in results.items" :key="result.url">
            <VideoItem v-if="shouldUseVideoItem(result)" :video="result" height="94" width="168" />
            <div v-if="!shouldUseVideoItem(result)" class="uk-text-secondary">
                <router-link :to="result.url">
                    <div class="relative">
                        <img style="width: 100%" :src="result.thumbnail" loading="lazy" />
                    </div>
                    <p>
                        <span v-text="result.name" />
                        <font-awesome-icon class="ml-1.5" v-if="result.verified" icon="check" />
                    </p>
                </router-link>
                <p v-if="result.description" v-text="result.description" />
                <router-link v-if="result.uploaderUrl" class="uk-link-muted" :to="result.uploaderUrl">
                    <p>
                        <span v-text="result.uploader" />
                        <font-awesome-icon class="ml-1.5" v-if="result.uploaderVerified" icon="check" />
                    </p>
                </router-link>

                <a v-if="result.uploaderName" class="uk-text-muted" v-text="result.uploaderName" />
                <strong v-if="result.videos >= 0"
                    ><br v-if="result.uploaderName" /><span v-text="`${result.videos} ${$t('video.videos')}`"
                /></strong>

                <br />
            </div>
        </div>
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
        this.updateResults();
    },
    activated() {
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
    },
};
</script>
