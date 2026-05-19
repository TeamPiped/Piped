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
            <TikTokFeed :videos="searchResults" :loading="loadingSearch" @watched="onWatched" />
        </div>

        <!-- trending tab -->
        <div v-else-if="activeTab === 'trending'">
            <TikTokFeed :videos="trendingVideos" :loading="loadingTrending" @watched="onWatched" />
        </div>

        <!-- for you tab -->
        <div v-else-if="activeTab === 'foryou'">
            <TikTokFeed :videos="forYouVideos" :loading="loadingForYou" @watched="onWatched" />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onActivated, watch } from "vue";
import { useI18n } from "vue-i18n";
import TikTokFeed from "./TikTokFeed.vue";

const { t } = useI18n();

const HISTORY_KEY = "edu_watch_history";
const HISTORY_LIMIT = 500;

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

// ── Watch history ──────────────────────────────────────────────────────────────

function getHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "{}");
    } catch {
        return {};
    }
}

function saveWatch(videoId, tags, watchPct) {
    try {
        const hist = getHistory();
        hist[videoId] = { tags: tags ?? [], watchPct: Math.min(1, watchPct), ts: Date.now() };
        const keys = Object.keys(hist).sort((a, b) => hist[b].ts - hist[a].ts);
        for (const k of keys.slice(HISTORY_LIMIT)) delete hist[k];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    } catch {
        // storage unavailable
    }
}

function onWatched({ video, watchPct }) {
    saveWatch(video.id, video.tags, watchPct);
}

// ── FYP ranking ────────────────────────────────────────────────────────────────

/**
 * Build a tag → interest weight map from local watch history.
 * High completion + recent watch = stronger signal.
 */
function buildTagInterest(hist) {
    const now = Date.now();
    const scores = {};
    for (const entry of Object.values(hist)) {
        const ageDays = (now - entry.ts) / 86_400_000;
        const recency = Math.max(0, 1 - ageDays / 30); // decays to 0 over 30 days
        const weight = entry.watchPct * recency;
        for (const tag of entry.tags ?? []) {
            scores[tag] = (scores[tag] ?? 0) + weight;
        }
    }
    return scores;
}

/**
 * Score a video for the FYP feed.
 * Returns -Infinity for already-seen videos.
 */
function scoreFYP(video, tagInterest, seenIds) {
    if (seenIds.has(video.id)) return -Infinity;

    let score = 0;

    // Tag affinity (primary signal — mirrors TikTok/YouTube topic interest)
    for (const tag of video.tags ?? []) {
        score += (tagInterest[tag] ?? 0) * 3;
    }

    // Mild popularity signal (log-scale so viral videos don't totally dominate)
    score += Math.log10(video.stats.plays + 1) * 0.3;

    // Exploration noise: higher weight when user has no preferences yet (cold start)
    const hasPref = score > 0;
    score += Math.random() * (hasPref ? 0.4 : 2.5);

    return score;
}

function rankFYP(videos) {
    const hist = getHistory();
    const tagInterest = buildTagInterest(hist);
    const seenIds = new Set(Object.keys(hist));

    return videos
        .map(v => ({ v, s: scoreFYP(v, tagInterest, seenIds) }))
        .filter(x => x.s > -Infinity)
        .sort((a, b) => b.s - a.s)
        .map(x => x.v);
}

// ── Fetching ───────────────────────────────────────────────────────────────────

async function eduFetch(path) {
    const resp = await fetch(`/math${path}`);
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    return resp.json();
}

async function loadForYou() {
    loadingForYou.value = true;
    try {
        // Fetch a larger pool so the ranking algo has material to work with
        const data = await eduFetch("/trending?count=60");
        forYouVideos.value = rankFYP(data.videos ?? []);
    } catch {
        // relay not running (dev without server/index.js started)
    } finally {
        loadingForYou.value = false;
    }
}

async function loadTrending() {
    loadingTrending.value = true;
    try {
        const data = await eduFetch("/trending?count=40");
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
        const data = await eduFetch(`/search?q=${encodeURIComponent(searchQuery.value)}`);
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
