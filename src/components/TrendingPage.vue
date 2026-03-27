<template>
    <h1 v-t="'titles.trending'" class="my-4 text-center font-bold" />

    <hr />

    <LoadingIndicatorPage
        :show-content="videos.length != 0"
        class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
    >
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
import { getPreferenceString } from "@/composables/usePreferences.js";
import { updateWatched } from "@/composables/useMisc.js";
import { fetchDeArrowContent } from "@/composables/useSubscriptions.js";
import { getHomePage } from "@/composables/useMisc.js";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const videos = ref([]);

async function fetchTrending(region) {
    return await fetchJson(apiUrl() + "/trending", {
        region: region || "US",
    });
}

onMounted(() => {
    if (route.path == import.meta.env.BASE_URL && getPreferenceString("homepage", "trending") == "feed") {
        return;
    }
    let region = getPreferenceString("region", "US");

    fetchTrending(region).then(vids => {
        videos.value = vids;
        updateWatched(videos.value);
        fetchDeArrowContent(videos.value);
    });
});

onActivated(() => {
    document.title = t("titles.trending") + " - Piped";
    if (videos.value.length > 0) updateWatched(videos.value);
    if (route.path == import.meta.env.BASE_URL) {
        let homepage = getHomePage();
        if (homepage !== undefined) router.push(homepage);
    }
});
</script>
