<template>
    <h1 v-t="'titles.trending'" class="my-4 text-center font-bold" />
    <hr />
    <LoadingIndicatorPage
        :show-content="loaded"
        class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
    >
        <p
            v-if="loaded && videos.length === 0 && personalizedOnly"
            v-t="'info.no_watch_history_trending'"
            class="col-span-full text-center text-gray-500"
        />
        <VideoItem v-for="video in videos" :key="video.url" :item="video" height="118" width="210" />
    </LoadingIndicatorPage>
</template>

<script setup>
import { ref, onMounted, onActivated } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import VideoItem from "./VideoItem.vue";
import { fetchJson, apiUrl } from "@/composables/useApi.js";
import { getPreferenceString, getPreferenceBoolean } from "@/composables/usePreferences.js";
import { updateWatched } from "@/composables/useMisc.js";
import { fetchDeArrowContent } from "@/composables/useSubscriptions.js";
import { getHomePage } from "@/composables/useMisc.js";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const videos = ref([]);
const loaded = ref(false);
const personalizedOnly = ref(false);
const firstActivation = ref(true);

function idbCursorToPromise(store, fn) {
    return new Promise((resolve, reject) => {
        const req = store.openCursor();
        req.onerror = () => reject(req.error);
        req.onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
                fn(cursor.value);
                cursor.continue();
            } else {
                resolve();
            }
        };
    });
}

async function getPreferredChannels() {
    if (!window.db || !getPreferenceBoolean("watchHistory", false)) return { ids: [], count: 0 };

    const tx = window.db.transaction("watch_history", "readonly");
    const store = tx.objectStore("watch_history");
    const counts = new Map();

    const countReq = store.count();
    const historyCount = await new Promise((res, rej) => {
        countReq.onsuccess = () => res(countReq.result);
        countReq.onerror = () => rej(countReq.error);
    });

    await idbCursorToPromise(store, video => {
        if (video.uploaderUrl) {
            const id = video.uploaderUrl.replace(/\/+$/, "").split("/").pop();
            if (id) counts.set(id, (counts.get(id) || 0) + 1);
        }
    });

    return {
        ids: Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([id]) => id),
        count: historyCount,
    };
}

const channelCache = new Map();
const CHANNEL_CACHE_TTL = 5 * 60 * 1000;

async function fetchChannelVideos(channelIds, historyCount) {
    const cacheKey = channelIds.slice().sort().join(",") + "@" + historyCount;
    const cached = channelCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CHANNEL_CACHE_TTL) return cached.data;

    const results = await Promise.allSettled(channelIds.map(id => fetchJson(apiUrl() + "/channel/" + id)));
    const data = results
        .filter(r => r.status === "fulfilled" && r.value?.relatedStreams)
        .flatMap(r =>
            r.value.relatedStreams
                .slice()
                .sort((a, b) => (b.uploaded ?? 0) - (a.uploaded ?? 0))
                .slice(0, 5),
        );
    channelCache.set(cacheKey, { ts: Date.now(), data });
    return data;
}

function interleave(trending, recommended) {
    const out = [];
    let ti = 0,
        ri = 0;
    while (ti < trending.length || ri < recommended.length) {
        for (let i = 0; i < 3 && ti < trending.length; i++) out.push(trending[ti++]);
        if (ri < recommended.length) out.push(recommended[ri++]);
    }
    return out;
}

async function fetchTrending(region) {
    const personalizedTrending = getPreferenceBoolean("personalizedTrending", false);
    const personalizedTrendingOnly = getPreferenceBoolean("personalizedTrendingOnly", false);

    if (!personalizedTrending) {
        return await fetchJson(apiUrl() + "/trending", { region: region || "US" });
    }

    const plainTrending = personalizedTrendingOnly
        ? Promise.resolve([])
        : fetchJson(apiUrl() + "/trending", { region: region || "US" });

    try {
        const [trending, { ids: preferredChannels, count: historyCount }] = await Promise.all([
            plainTrending,
            getPreferredChannels(),
        ]);

        if (preferredChannels.length === 0) return trending;

        const recommended = await fetchChannelVideos(preferredChannels, historyCount);

        const seen = new Set();
        const dedup = arr =>
            arr.filter(v => {
                const qs = v.url?.includes("?") ? v.url.slice(v.url.indexOf("?")) : "";
                const id = qs ? new URLSearchParams(qs).get("v") : null;
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            });

        if (personalizedTrendingOnly) return dedup(recommended);

        return interleave(dedup(trending), dedup(recommended));
    } catch {
        return await fetchJson(apiUrl() + "/trending", { region: region || "US" });
    }
}

function updatePersonalizedOnly() {
    personalizedOnly.value =
        getPreferenceBoolean("personalizedTrending", false) && getPreferenceBoolean("personalizedTrendingOnly", false);
}

onMounted(() => {
    if (route.path == import.meta.env.BASE_URL && getPreferenceString("homepage", "trending") == "feed") {
        firstActivation.value = false;
        return;
    }
    updatePersonalizedOnly();
    const region = getPreferenceString("region", "US");
    fetchTrending(region).then(vids => {
        videos.value = vids;
        loaded.value = true;
        updateWatched(videos.value);
        fetchDeArrowContent(videos.value);
        firstActivation.value = false;
    });
});

onActivated(() => {
    document.title = t("titles.trending") + " - Piped";
    if (videos.value.length > 0) updateWatched(videos.value);
    if (route.path == import.meta.env.BASE_URL) {
        const homepage = getHomePage();
        if (homepage !== undefined) router.push(homepage);
    }
    if (firstActivation.value) {
        firstActivation.value = false;
        return;
    }
    if (getPreferenceBoolean("personalizedTrending", false)) {
        updatePersonalizedOnly();
        channelCache.clear();
        loaded.value = false;
        const region = getPreferenceString("region", "US");
        fetchTrending(region).then(vids => {
            videos.value = vids;
            loaded.value = true;
            updateWatched(videos.value);
            fetchDeArrowContent(videos.value);
        });
    }
});
</script>
