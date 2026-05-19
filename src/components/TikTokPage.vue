<template>
    <div>
        <div class="mb-4 flex items-center gap-3">
            <i-fa6-brands-tiktok class="text-2xl" />
            <h1 class="text-2xl font-bold">TikTok</h1>
        </div>

        <!-- API config notice -->
        <div
            v-if="!tiktokApiUrl"
            class="mb-6 rounded-xl border border-yellow-400/50 bg-yellow-50 p-5 dark:bg-yellow-900/20"
        >
            <div class="flex items-start gap-3">
                <i-fa6-solid-triangle-exclamation class="mt-0.5 shrink-0 text-yellow-500" />
                <div>
                    <p class="font-semibold text-yellow-800 dark:text-yellow-300">
                        {{ $t("tiktok.api_not_configured") }}
                    </p>
                    <p class="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                        {{ $t("tiktok.api_configure_hint") }}
                    </p>
                    <router-link
                        to="/preferences#tiktok"
                        class="mt-2 inline-block rounded-md bg-yellow-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-yellow-600"
                    >
                        {{ $t("tiktok.go_to_settings") }}
                    </router-link>
                </div>
            </div>
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
            <TikTokFeed :videos="forYouVideos" :loading="loadingForYou" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, watch } from "vue";
import { useI18n } from "vue-i18n";
import TikTokFeed from "./TikTokFeed.vue";
import { getPreferenceString } from "@/composables/usePreferences.js";

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

const tiktokApiUrl = computed(() => getPreferenceString("tiktokApi", null));

async function callTikTokApi(endpoint, params = {}) {
    const base = tiktokApiUrl.value;
    if (!base) return null;
    const url = new URL(base.replace(/\/$/, "") + endpoint);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return resp.json();
}

function normalizeVideo(v) {
    // Normalize different API shapes into a common format
    return {
        id: v.id ?? v.aweme_id ?? v.video_id,
        title: v.desc ?? v.description ?? v.title ?? "",
        author: {
            nickname: v.author?.nickname ?? v.author?.unique_id ?? v.username ?? "Unknown",
            avatarUrl: v.author?.avatar_thumb?.url_list?.[0] ?? v.author?.avatar ?? v.avatarUrl ?? null,
            uniqueId: v.author?.unique_id ?? v.author_name ?? "",
        },
        stats: {
            plays: v.stats?.play_count ?? v.playCount ?? 0,
            likes: v.stats?.digg_count ?? v.likeCount ?? 0,
            comments: v.stats?.comment_count ?? v.commentCount ?? 0,
        },
        video: {
            cover: v.video?.cover?.url_list?.[0] ?? v.thumbnail ?? v.cover ?? null,
            playUrl: v.video?.play_addr?.url_list?.[0] ?? v.videoUrl ?? v.play_url ?? null,
        },
    };
}

async function loadForYou() {
    if (!tiktokApiUrl.value) return;
    loadingForYou.value = true;
    try {
        const data = await callTikTokApi("/feed/for_you");
        if (data) {
            const items = data.videos ?? data.aweme_list ?? data.items ?? [];
            forYouVideos.value = items.map(normalizeVideo);
        }
    } finally {
        loadingForYou.value = false;
    }
}

async function loadTrending() {
    if (!tiktokApiUrl.value) return;
    loadingTrending.value = true;
    try {
        const data = await callTikTokApi("/feed/trending");
        if (data) {
            const items = data.videos ?? data.aweme_list ?? data.items ?? [];
            trendingVideos.value = items.map(normalizeVideo);
        }
    } finally {
        loadingTrending.value = false;
    }
}

async function doSearch() {
    if (!searchQuery.value.trim() || !tiktokApiUrl.value) return;
    loadingSearch.value = true;
    try {
        const data = await callTikTokApi("/search", { q: searchQuery.value, type: "video" });
        if (data) {
            const items = data.videos ?? data.data ?? data.items ?? [];
            searchResults.value = items.map(normalizeVideo);
        }
    } finally {
        loadingSearch.value = false;
    }
}

watch(activeTab, tab => {
    if (tab === "trending" && trendingVideos.value.length === 0) loadTrending();
    if (tab === "foryou" && forYouVideos.value.length === 0) loadForYou();
});

onMounted(() => {
    loadForYou();
});

onActivated(() => {
    document.title = "TikTok - Piped";
});
</script>
