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

<script>
import ErrorHandler from "./ErrorHandler.vue";
import ContentItem from "./ContentItem.vue";
import WatchOnButton from "./WatchOnButton.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import CollapsableText from "./CollapsableText.vue";
import AddToGroupModal from "./AddToGroupModal.vue";

export default {
    components: {
        ErrorHandler,
        ContentItem,
        WatchOnButton,
        LoadingIndicatorPage,
        CollapsableText,
        AddToGroupModal,
    },
    data() {
        return {
            channel: null,
            subscribed: false,
            tabs: [],
            selectedTab: 0,
            contentItems: [],
            showGroupModal: false,
        };
    },
    mounted() {
        this.getChannelData();
    },
    activated() {
        if (this.channel && !this.channel.error) document.title = this.channel.name + " - Piped";
        window.addEventListener("scroll", this.handleScroll);
        if (this.channel && !this.channel.error) this.updateWatched(this.channel.relatedStreams);
    },
    deactivated() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchSubscribedStatus() {
            if (!this.channel.id) return;

            this.subscribed = await this.fetchSubscriptionStatus(this.channel.id);
        },
        async fetchChannel() {
            const url = this.$route.path.includes("@")
                ? this.apiUrl() + "/@/" + this.$route.params.channelId
                : this.apiUrl() + "/" + this.$route.params.path + "/" + this.$route.params.channelId;
            return await this.fetchJson(url);
        },
        async getChannelData() {
            this.fetchChannel()
                .then(data => (this.channel = data))
                .then(() => {
                    if (!this.channel.error) {
                        document.title = this.channel.name + " - Piped";
                        this.contentItems = this.channel.relatedStreams;
                        this.fetchSubscribedStatus();
                        this.updateWatched(this.channel.relatedStreams);
                        this.fetchDeArrowContent(this.channel.relatedStreams);
                        this.tabs.push({
                            translatedName: this.$t("video.videos"),
                        });
                        const tabQuery = this.$route.query.tab;
                        for (let i = 0; i < this.channel.tabs.length; i++) {
                            let tab = this.channel.tabs[i];
                            tab.translatedName = this.getTranslatedTabName(tab.name);
                            this.tabs.push(tab);
                            if (tab.name === tabQuery) this.loadTab(i + 1);
                        }
                    }
                });
        },
        handleScroll() {
            if (
                this.loading ||
                !this.channel ||
                !this.channel.nextpage ||
                (this.selectedTab != 0 && !this.tabs[this.selectedTab].tabNextPage)
            )
                return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                if (this.selectedTab == 0) {
                    this.fetchChannelNextPage();
                } else {
                    this.fetchChannelTabNextPage();
                }
            }
        },
        fetchChannelNextPage() {
            this.fetchJson(this.apiUrl() + "/nextpage/channel/" + this.channel.id, {
                nextpage: this.channel.nextpage,
            }).then(json => {
                this.channel.nextpage = json.nextpage;
                this.loading = false;
                this.updateWatched(json.relatedStreams);
                json.relatedStreams.map(stream => this.contentItems.push(stream));
                this.fetchDeArrowContent(this.contentItems);
            });
        },
        fetchChannelTabNextPage() {
            this.fetchJson(this.apiUrl() + "/channels/tabs", {
                data: this.tabs[this.selectedTab].data,
                nextpage: this.tabs[this.selectedTab].tabNextPage,
            }).then(json => {
                this.tabs[this.selectedTab].tabNextPage = json.nextpage;
                this.loading = false;
                json.content.map(item => this.contentItems.push(item));
                this.fetchDeArrowContent(this.contentItems);
                this.tabs[this.selectedTab].content = this.contentItems;
            });
        },
        subscribeHandler() {
            this.toggleSubscriptionState(this.channel.id, this.subscribed).then(success => {
                if (success) this.subscribed = !this.subscribed;
            });
        },
        getTranslatedTabName(tabName) {
            let translatedTabName = tabName;
            switch (tabName) {
                case "livestreams":
                    translatedTabName = this.$t("titles.livestreams");
                    break;
                case "playlists":
                    translatedTabName = this.$t("titles.playlists");
                    break;
                case "albums":
                    translatedTabName = this.$t("titles.albums");
                    break;
                case "shorts":
                    translatedTabName = this.$t("video.shorts");
                    break;
                default:
                    console.error(`Tab name "${tabName}" is not translated yet!`);
                    break;
            }
            return translatedTabName;
        },
        loadTab(index) {
            this.selectedTab = index;

            // update the tab query in the url path
            const url = new URL(window.location);
            url.searchParams.set("tab", this.tabs[index].name ?? "videos");
            window.history.replaceState(window.history.state, "", url);

            if (index == 0) {
                this.contentItems = this.channel.relatedStreams;
                return;
            }

            if (this.tabs[index].content) {
                this.contentItems = this.tabs[index].content;
                return;
            }
            this.fetchJson(this.apiUrl() + "/channels/tabs", {
                data: this.tabs[index].data,
            }).then(tab => {
                this.contentItems = this.tabs[index].content = tab.content;
                this.fetchDeArrowContent(this.contentItems);
                this.tabs[this.selectedTab].tabNextPage = tab.nextpage;
            });
        },
    },
};
</script>

<style>
.active {
    border: 0.1rem outset red;
}
</style>
