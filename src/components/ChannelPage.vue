<template>
    <ErrorHandler v-if="channel && channel.error" :message="channel.message" :error="channel.error" />

    <LoadingIndicatorPage :show-content="channel != null && !channel.error">
        <img
            v-if="channel.bannerUrl"
            loading="lazy"
            :src="channel.bannerUrl"
            class="h-30 w-full object-cover py-1.5 md:h-50"
        />
        <div class="flex flex-col items-center justify-between md:flex-row">
            <div class="flex place-items-center">
                <img height="48" width="48" class="m-1 rounded-full" :src="channel.avatarUrl" />
                <div class="flex items-center gap-1">
                    <h1 class="!text-xl" v-text="channel.name" />
                    <i v-if="channel.verified" class="i-fa6-solid:check !text-xl" />
                </div>
            </div>

            <div class="flex gap-2">
                <button
                    class="btn"
                    @click="subscribeHandler"
                    v-text="
                        $t('actions.' + (subscribed ? 'unsubscribe' : 'subscribe')) +
                        ' - ' +
                        numberFormat(channel.subscriberCount)
                    "
                ></button>

                <button
                    v-if="subscribed"
                    v-t="'actions.add_to_group'"
                    class="btn"
                    @click="showGroupModal = true"
                ></button>

                <!-- RSS Feed button -->
                <a
                    v-if="channel.id"
                    aria-label="RSS feed"
                    title="RSS feed"
                    role="button"
                    :href="`${apiUrl()}/feed/unauthenticated/rss?channels=${channel.id}`"
                    target="_blank"
                    class="btn flex-col"
                >
                    <i class="i-fa6-solid:rss" />
                </a>
            </div>
        </div>

        <CollapsableText :text="channel.description" />

        <WatchOnButton :link="`https://youtube.com/channel/${channel.id}`" />

        <div class="mx-1 my-2 flex">
            <button
                v-for="(tab, index) in tabs"
                :key="tab.name"
                class="btn mr-2"
                :class="{ active: selectedTab == index }"
                @click="loadTab(index)"
            >
                <span v-text="tab.translatedName"></span>
            </button>
            <router-link :to="`/playlist?list=UU${channel.id.substring(2)}`">
                <button class="btn h-full">Play all videos</button>
            </router-link>
        </div>

        <hr />

        <div class="video-grid">
            <ContentItem
                v-for="item in contentItems"
                :key="item.url"
                :item="item"
                height="94"
                width="168"
                hide-channel
            />
        </div>

        <AddToGroupModal v-if="showGroupModal" :channel-id="channel.id.substr(-24)" @close="showGroupModal = false" />
    </LoadingIndicatorPage>
</template>

<script setup>
import { ref, onMounted, onActivated, onDeactivated, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import ErrorHandler from "./ErrorHandler.vue";
import ContentItem from "./ContentItem.vue";
import WatchOnButton from "./WatchOnButton.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import CollapsableText from "./CollapsableText.vue";
import AddToGroupModal from "./AddToGroupModal.vue";
import { fetchJson, apiUrl } from "@/composables/useApi.js";
import { numberFormat } from "@/composables/useFormatting.js";
import {
    fetchSubscriptionStatus,
    toggleSubscriptionState,
    fetchDeArrowContent,
} from "@/composables/useSubscriptions.js";
import { updateWatched } from "@/composables/useMisc.js";

const route = useRoute();
const { t } = useI18n();

const channel = ref(null);
const subscribed = ref(false);
const tabs = ref([]);
const selectedTab = ref(0);
const contentItems = ref([]);
const showGroupModal = ref(false);
let loading = false;

async function fetchSubscribedStatus() {
    if (!channel.value.id) return;
    subscribed.value = await fetchSubscriptionStatus(channel.value.id);
}

async function fetchChannel() {
    const url = route.path.includes("@")
        ? apiUrl() + "/@/" + route.params.channelId
        : apiUrl() + "/" + route.params.path + "/" + route.params.channelId;
    return await fetchJson(url);
}

async function getChannelData() {
    fetchChannel()
        .then(data => (channel.value = data))
        .then(() => {
            if (!channel.value.error) {
                document.title = channel.value.name + " - Piped";
                contentItems.value = channel.value.relatedStreams;
                fetchSubscribedStatus();
                updateWatched(channel.value.relatedStreams);
                fetchDeArrowContent(channel.value.relatedStreams);
                tabs.value.push({
                    translatedName: t("video.videos"),
                });
                const tabQuery = route.query.tab;
                for (let i = 0; i < channel.value.tabs.length; i++) {
                    let tab = channel.value.tabs[i];
                    tab.translatedName = getTranslatedTabName(tab.name);
                    tabs.value.push(tab);
                    if (tab.name === tabQuery) loadTab(i + 1);
                }
            }
        });
}

function handleScroll() {
    if (
        loading ||
        !channel.value ||
        !channel.value.nextpage ||
        (selectedTab.value != 0 && !tabs.value[selectedTab.value].tabNextPage)
    )
        return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
        loading = true;
        if (selectedTab.value == 0) {
            fetchChannelNextPage();
        } else {
            fetchChannelTabNextPage();
        }
    }
}

function fetchChannelNextPage() {
    fetchJson(apiUrl() + "/nextpage/channel/" + channel.value.id, {
        nextpage: channel.value.nextpage,
    }).then(json => {
        channel.value.nextpage = json.nextpage;
        loading = false;
        updateWatched(json.relatedStreams);
        contentItems.value.push(...json.relatedStreams);
        fetchDeArrowContent(json.relatedStreams);
    });
}

function fetchChannelTabNextPage() {
    fetchJson(apiUrl() + "/channels/tabs", {
        data: tabs.value[selectedTab.value].data,
        nextpage: tabs.value[selectedTab.value].tabNextPage,
    }).then(json => {
        tabs.value[selectedTab.value].tabNextPage = json.nextpage;
        loading = false;
        contentItems.value.push(...json.content);
        fetchDeArrowContent(json.content);
        tabs.value[selectedTab.value].content = contentItems.value;
    });
}

function subscribeHandler() {
    toggleSubscriptionState(channel.value.id, subscribed.value).then(success => {
        if (success) subscribed.value = !subscribed.value;
    });
}

function getTranslatedTabName(tabName) {
    let translatedTabName = tabName;
    switch (tabName) {
        case "livestreams":
            translatedTabName = t("titles.livestreams");
            break;
        case "playlists":
            translatedTabName = t("titles.playlists");
            break;
        case "albums":
            translatedTabName = t("titles.albums");
            break;
        case "shorts":
            translatedTabName = t("video.shorts");
            break;
        default:
            console.error(`Tab name "${tabName}" is not translated yet!`);
            break;
    }
    return translatedTabName;
}

function loadTab(index) {
    selectedTab.value = index;

    // update the tab query in the url path
    const url = new URL(window.location);
    url.searchParams.set("tab", tabs.value[index].name ?? "videos");
    window.history.replaceState(window.history.state, "", url);

    if (index == 0) {
        contentItems.value = channel.value.relatedStreams;
        return;
    }

    if (tabs.value[index].content) {
        contentItems.value = tabs.value[index].content;
        return;
    }
    fetchJson(apiUrl() + "/channels/tabs", {
        data: tabs.value[index].data,
    }).then(tab => {
        contentItems.value = tabs.value[index].content = tab.content;
        fetchDeArrowContent(tab.content);
        tabs.value[selectedTab.value].tabNextPage = tab.nextpage;
    });
}

onMounted(() => {
    getChannelData();
});

onActivated(() => {
    if (channel.value && !channel.value.error) document.title = channel.value.name + " - Piped";
    window.addEventListener("scroll", handleScroll);
    if (channel.value && !channel.value.error) updateWatched(channel.value.relatedStreams);
});

onDeactivated(() => {
    window.removeEventListener("scroll", handleScroll);
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>

<style>
.active {
    border: 0.1rem outset red;
}
</style>
