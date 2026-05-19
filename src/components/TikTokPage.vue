<template>
    <div>
        <div class="mb-4 flex items-center gap-3">
            <i-fa6-brands-tiktok class="text-2xl" />
            <h1 class="text-2xl font-bold">TikTok</h1>
        </div>

        <!-- tabs -->
        <div class="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-dark-800">
            <button
                v-for="tab in tabs"
                :key="tab.id"
                class="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
                :class="
                    activeTab === tab.id
                        ? 'bg-white text-gray-900 shadow-sm dark:bg-dark-400 dark:text-white'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
                "
                @click="activeTab = tab.id"
            >
                {{ tab.label }}
            </button>
        </div>

        <!-- search tab -->
        <div v-if="activeTab === 'search'">
            <div class="mb-4 flex gap-2">
                <input
                    v-model="searchQuery"
                    type="text"
                    :placeholder="$t('tiktok.search_placeholder')"
                    class="flex-1 rounded-lg bg-gray-200 px-4 py-2.5 text-gray-800 focus:ring-2 focus:ring-red-400 focus:outline-none dark:bg-dark-400 dark:text-gray-200"
                    @keyup.enter="doSearch"
                />
                <button
                    class="rounded-lg bg-red-500 px-5 py-2.5 font-medium text-white hover:bg-red-600"
                    @click="doSearch"
                >
                    <i-fa6-solid-magnifying-glass />
                </button>
            </div>
            <TikTokFeed :videos="searchResults" :loading="loadingSearch" />
        </div>

        <!-- trending tab -->
        <div v-else-if="activeTab === 'trending'">
            <TikTokFeed :videos="trendingVideos" :loading="loadingTrending" />
        </div>

        <!-- for you tab -->
        <div v-else-if="activeTab === 'foryou'">
            <!-- Note about unauthenticated feed -->
            <div
                class="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
            >
                <i-fa6-solid-circle-info class="mr-1.5 inline" />
                {{ $t("tiktok.no_auth_notice") }}
            </div>
            <TikTokFeed :videos="forYouVideos" :loading="loadingForYou" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onActivated, watch } from "vue";
import { useI18n } from "vue-i18n";
import TikTokFeed from "./TikTokFeed.vue";

const { t } = useI18n();

const tabs = [
    { id: "foryou", label: t("tiktok.for_you") },
    { id: "trending", label: t("titles.trending") },
    { id: "search", label: t("actions.search") },
];

const activeTab = ref("foryou");
const searchQuery = ref("");
const searchResults = ref([]);
const trendingVideos = ref([]);
const forYouVideos = ref([]);
const loadingSearch = ref(false);
const loadingTrending = ref(false);
const loadingForYou = ref(false);

/** Call the self-hosted TikTok proxy at /tiktok/<path>. */
async function proxyFetch(path) {
    const resp = await fetch(`/tiktok${path}`);
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    return resp.json();
}

async function loadForYou() {
    loadingForYou.value = true;
    try {
        const data = await proxyFetch("/foryou");
        forYouVideos.value = data.videos ?? [];
    } catch {
        // proxy unreachable in dev without the server running
    } finally {
        loadingForYou.value = false;
    }
}

async function loadTrending() {
    loadingTrending.value = true;
    try {
        const data = await proxyFetch("/trending");
        trendingVideos.value = data.videos ?? [];
    } catch {
        // ignore
    } finally {
        loadingTrending.value = false;
    }
}

async function doSearch() {
    if (!searchQuery.value.trim()) return;
    loadingSearch.value = true;
    try {
        const data = await proxyFetch(`/search?q=${encodeURIComponent(searchQuery.value)}`);
        searchResults.value = data.videos ?? [];
    } catch {
        // ignore
    } finally {
        loadingSearch.value = false;
    }
}

watch(activeTab, tab => {
    if (tab === "trending" && trendingVideos.value.length === 0) loadTrending();
    if (tab === "foryou" && forYouVideos.value.length === 0) loadForYou();
});

onMounted(() => loadForYou());

onActivated(() => {
    document.title = "TikTok - Piped";
});
</script>
