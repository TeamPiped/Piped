<template>
    <div>
        <!-- Continue Watching strip -->
        <ContinueWatchingSection v-if="continueWatching.length > 0" :videos="continueWatching" class="mb-6" />

        <!-- Recently visited channels -->
        <RecentChannelsSection />

        <div class="mb-4 flex items-center justify-between">
            <h1 class="text-2xl font-bold">{{ $t("titles.recommended") }}</h1>
            <div class="flex items-center gap-2">
                <RandomPickButton source="feed" />
                <button
                    class="flex items-center gap-1.5 rounded-md bg-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-300 dark:bg-dark-400 dark:text-gray-300 dark:hover:bg-dark-300"
                    :disabled="loading"
                    @click="refresh"
                >
                    <i-fa6-solid-rotate-right :class="{ 'animate-spin': loading }" />
                    {{ $t("actions.refresh") }}
                </button>
            </div>
        </div>

        <LoadingIndicatorPage
            :show-content="videos.length > 0 || !loading"
            class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
        >
            <template v-if="videos.length === 0 && !loading">
                <div class="col-span-full flex flex-col items-center gap-3 py-16 text-gray-500">
                    <i-fa6-solid-wand-magic-sparkles class="size-12" />
                    <p class="text-center text-lg">{{ $t("info.recommended_empty") }}</p>
                    <router-link to="/trending" class="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                        {{ $t("titles.trending") }}
                    </router-link>
                </div>
            </template>
            <VideoItem v-for="video in videos" :key="video.url" :item="video" height="118" width="210" />
        </LoadingIndicatorPage>
    </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import VideoItem from "./VideoItem.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import ContinueWatchingSection from "./ContinueWatchingSection.vue";
import RecentChannelsSection from "./RecentChannelsSection.vue";
import RandomPickButton from "./RandomPickButton.vue";
import { fetchRecommended } from "@/composables/useRecommended.js";
import { updateWatched } from "@/composables/useMisc.js";
import { fetchDeArrowContent } from "@/composables/useSubscriptions.js";

const { t } = useI18n();

const videos = ref([]);
const continueWatching = ref([]);
const loading = ref(false);

async function loadContinueWatching() {
    if (!window.db) return;
    return new Promise(resolve => {
        const tx = window.db.transaction("watch_history", "readonly");
        const store = tx.objectStore("watch_history");
        const req = store.index("watchedAt").getAll();
        req.onsuccess = () => {
            const results = (req.result ?? [])
                .filter(v => v.currentTime > 0 && v.currentTime < v.duration * 0.9)
                .sort((a, b) => (b.watchedAt ?? 0) - (a.watchedAt ?? 0))
                .slice(0, 8)
                .map(v => ({
                    url: `/watch?v=${v.videoId}`,
                    title: v.title,
                    thumbnail: v.thumbnail,
                    uploaderUrl: v.uploaderUrl,
                    uploaderName: v.uploaderName,
                    duration: v.duration,
                    currentTime: v.currentTime,
                    watched: false,
                }));
            continueWatching.value = results;
            resolve();
        };
        req.onerror = () => resolve();
    });
}

async function refresh() {
    loading.value = true;
    try {
        await loadContinueWatching();
        const result = await fetchRecommended();
        videos.value = result;
        updateWatched(videos.value);
        fetchDeArrowContent(videos.value);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    refresh();
});

onActivated(() => {
    document.title = t("titles.recommended") + " - Piped";
    if (videos.value.length > 0) updateWatched(videos.value);
});
</script>
