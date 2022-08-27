<template>
    <h1 class="my-2 text-center" v-text="$route.query.search_query" />

    <label for="ddlSearchFilters">
        <strong v-text="`${$t('actions.filter')}:`" />
    </label>
    <select
        id="ddlSearchFilters"
        v-model="selectedFilter"
        default="all"
        class="h-8 w-auto rounded-md bg-gray-300 px-2.5 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
        @change="updateFilter()"
    >
        <option v-for="filter in availableFilters" :key="filter" v-t="`search.${filter}`" :value="filter" />
    </select>

    <hr />

    <div v-if="results && results.corrected">
        <i18n-t keypath="search.did_you_mean" tag="div" class="text-lg">
            <router-link :to="{ name: 'SearchResults', query: { search_query: results.suggestion } }">
                <em v-text="results.suggestion" />
            </router-link>
        </i18n-t>
    </div>

    <LoadingIndicatorPage
        :show-content="Boolean(results != null && results.items?.length)"
        class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
    >
        <template v-for="result in results.items" :key="result.url">
            <div v-if="!isBlocked(result)">
                <ContentItem :item="result" height="94" width="168" />
            </div>
        </template>
    </LoadingIndicatorPage>
</template>

<script setup>
import { ref, onMounted, onUpdated, onActivated, onDeactivated, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ContentItem from "./ContentItem.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import { fetchJson, apiUrl } from "@/composables/useApi.js";
import { isChannelBlocked } from "@/composables/useChannels.js";
import { getPreferenceBoolean } from "@/composables/usePreferences.js";
import { updateWatched } from "@/composables/useMisc.js";

const route = useRoute();
const router = useRouter();

const results = ref(null);
const availableFilters = [
    "all",
    "videos",
    "channels",
    "playlists",
    "music_songs",
    "music_videos",
    "music_albums",
    "music_playlists",
    "music_artists",
];
const selectedFilter = ref(route.query.filter ?? "all");
let loading = false;

async function fetchResultsData() {
    return await fetchJson(apiUrl() + "/search", {
        q: route.query.search_query,
        filter: route.query.filter ?? "all",
    });
}

async function updateResults() {
    document.title = route.query.search_query + " - Piped";
    fetchResultsData().then(json => {
        results.value = json;
        updateWatched(results.value.items);
    });
}

function updateFilter() {
    router.replace({
        query: {
            search_query: route.query.search_query,
            filter: selectedFilter.value,
        },
    });
}

function handleScroll() {
    if (loading || !results.value || !results.value.nextpage) return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
        loading = true;
        fetchJson(apiUrl() + "/nextpage/search", {
            nextpage: results.value.nextpage,
            q: route.query.search_query,
            filter: route.query.filter ?? "all",
        }).then(json => {
            results.value.nextpage = json.nextpage;
            results.value.id = json.id;
            loading = false;
            json.items.map(stream => results.value.items.push(stream));
        });
    }
}

function handleRedirect() {
    const query = route.query.search_query;
    const url =
        /(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm.exec(query)?.[1] ??
        /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm
            .exec(query)?.[1]
            .replace(/^/, "/watch?v=");
    if (url) {
        router.push(url);
        return true;
    }
}

function saveQueryToHistory() {
    if (!getPreferenceBoolean("searchHistory", false)) return;
    const query = route.query.search_query;
    if (!query) return;
    const searchHistory = JSON.parse(localStorage.getItem("search_history")) ?? [];
    if (searchHistory.includes(query)) {
        const index = searchHistory.indexOf(query);
        searchHistory.splice(index, 1);
    }
    searchHistory.unshift(query);
    if (searchHistory.length > 10) searchHistory.shift();
    localStorage.setItem("search_history", JSON.stringify(searchHistory));
}

function isBlocked(result) {
    if (!result.uploaderUrl) {
        // item is a channel
        return isChannelBlocked(result.url);
    }
    return isChannelBlocked(result.uploaderUrl);
}

onMounted(() => {
    if (handleRedirect()) return;
    updateResults();
    saveQueryToHistory();
});

onUpdated(() => {
    if (route.query.search_query !== undefined) {
        document.title = route.query.search_query + " - Piped";
    }
});

onActivated(() => {
    handleRedirect();
    window.addEventListener("scroll", handleScroll);
});

onDeactivated(() => {
    window.removeEventListener("scroll", handleScroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>
