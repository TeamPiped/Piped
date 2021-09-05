<template>
    <h1 class="uk-text-center">
        {{ $route.query.search_query }}
    </h1>

    <label for="ddlSearchFilters"><b>Filter: </b></label>
    <select
        id="ddlSearchFilters"
        default="all"
        class="uk-select uk-width-auto"
        style="height: 100%"
        v-model="selectedFilter"
        @change="updateResults()"
    >
        <option v-bind:key="filter" v-for="filter in availableFilters" v-bind:value="filter">
            {{ filter.replace("_", " ") }}
        </option>
    </select>

    <hr />

    <div v-if="results" class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            :style="[{ background: backgroundColor }]"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="result.url"
            v-for="result in results.items"
        >
            <VideoItem v-if="shouldUseVideoItem(result)" :video="result" height="94" width="168" />
            <div class="uk-text-secondary" v-if="!shouldUseVideoItem(result)">
                <router-link class="uk-text-emphasis" v-bind:to="result.url">
                    <div class="uk-position-relative">
                        <img style="width: 100%" v-bind:src="result.thumbnail" loading="lazy" />
                    </div>
                    <p>
                        {{ result.name }}&thinsp;<font-awesome-icon
                            v-if="result.verified"
                            icon="check"
                        ></font-awesome-icon>
                    </p>
                </router-link>
                <p v-if="result.description">{{ result.description }}</p>
                <router-link class="uk-link-muted" v-if="result.uploaderUrl" v-bind:to="result.uploaderUrl">
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

export default {
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
    components: {
        VideoItem,
    },
};
</script>
