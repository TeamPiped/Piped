<template>
    <h1 v-t="'titles.feed'" class="my-4 text-center font-bold" />

    <div class="flex flex-col flex-wrap gap-2 *:flex *:items-center *:gap-1 md:flex-row md:items-center">
        <span>
            <label for="filters">
                <strong v-text="`${$t('actions.filter')}:`" />
            </label>
            <select
                id="filters"
                v-model="selectedFilter"
                default="all"
                class="h-8 grow bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
                @change="onFilterChange()"
            >
                <option v-for="filter in availableFilters" :key="filter" v-t="`video.${filter}`" :value="filter" />
            </select>
        </span>

        <span>
            <label for="group-selector">
                <strong v-text="`${$t('titles.channel_groups')}:`" />
            </label>
            <select
                id="group-selector"
                v-model="selectedGroupName"
                default=""
                class="h-8 grow bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
            >
                <option v-t="`video.all`" value="" />
                <option
                    v-for="group in channelGroups"
                    :key="group.groupName"
                    :value="group.groupName"
                    v-text="group.groupName"
                />
            </select>
        </span>

        <span class="md:ml-auto">
            <SortingSelector by-key="uploaded" @apply="order => videos.sort(order)" />
        </span>
    </div>
    <hr />

    <span class="flex gap-2">
        <router-link
            v-t="'titles.subscriptions'"
            class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            to="/subscriptions"
        />
        <a
            :href="getRssUrl"
            class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
        >
            <i-fa6-solid-rss />
        </a>
    </span>
    <hr />

    <LoadingIndicatorPage
        :show-content="videosStore != null"
        class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
    >
        <template v-for="video in filteredVideos" :key="video.url">
            <VideoItem v-if="shouldShowVideo(video)" :is-feed="true" :item="video" @update:watched="onUpdateWatched" />
        </template>
    </LoadingIndicatorPage>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onDeactivated, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import VideoItem from "./VideoItem.vue";
import SortingSelector from "./SortingSelector.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import { authApiUrl, getAuthToken, isAuthenticated } from "@/composables/useApi.js";
import { getPreferenceBoolean, getPreferenceString, setPreference } from "@/composables/usePreferences.js";
import { fetchFeed, getUnauthenticatedChannels, fetchDeArrowContent } from "@/composables/useSubscriptions.js";
import { getChannelGroups } from "@/composables/useChannelGroups.js";
import { updateWatched } from "@/composables/useMisc.js";

const { t } = useI18n();

let currentVideoCount = 0;
const videoStep = 100;
let videosStore = null;
const videos = ref([]);
const availableFilters = ["all", "shorts", "videos"];
const selectedFilter = ref("all");
const selectedGroupName = ref("");
const channelGroups = ref([]);

const getRssUrl = computed(() => {
    if (isAuthenticated()) return authApiUrl() + "/feed/rss?authToken=" + getAuthToken();
    else return authApiUrl() + "/feed/unauthenticated/rss?channels=" + getUnauthenticatedChannels();
});

const filteredVideos = computed(() => {
    const selectedGroup = channelGroups.value.filter(group => group.groupName == selectedGroupName.value);

    const vids = getPreferenceBoolean("hideWatched", false)
        ? videos.value.filter(video => !video.watched)
        : videos.value;

    return selectedGroupName.value == ""
        ? vids
        : vids.filter(video => selectedGroup[0].channels.includes(video.uploaderUrl.substr(-24)));
});

function loadMoreVideos() {
    if (!videosStore) return;
    currentVideoCount = Math.min(currentVideoCount + videoStep, videosStore.length);
    if (videos.value.length != videosStore.length) {
        fetchDeArrowContent(videosStore.slice(videos.value.length, currentVideoCount));
        videos.value = videosStore.slice(0, currentVideoCount);
    }
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
        loadMoreVideos();
    }
}

function onUpdateWatched(urls = null) {
    if (urls === null) {
        if (videos.value.length > 0) updateWatched(videos.value);
        return;
    }

    const subset = videos.value.filter(({ url }) => urls.includes(url));
    if (subset.length > 0) updateWatched(subset);
}

function shouldShowVideo(video) {
    switch (selectedFilter.value.toLowerCase()) {
        case "shorts":
            return video.isShort;
        case "videos":
            return !video.isShort;
        default:
            return true;
    }
}

function onFilterChange() {
    setPreference("feedFilter", selectedFilter.value);
}

onMounted(() => {
    fetchFeed().then(resp => {
        if (resp.error) {
            alert(resp.error);
            return;
        }

        videosStore = resp;
        loadMoreVideos();
        updateWatched(videos.value);
    });

    selectedFilter.value = getPreferenceString("feedFilter") ?? "all";

    if (!window.db) return;

    (async () => {
        const groups = await getChannelGroups();
        channelGroups.value.push(...groups);
    })();
});

onActivated(() => {
    document.title = t("titles.feed") + " - Piped";
    if (videos.value.length > 0) updateWatched(videos.value);
    window.addEventListener("scroll", handleScroll);
});

onDeactivated(() => {
    window.removeEventListener("scroll", handleScroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>
