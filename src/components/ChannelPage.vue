<template>
    <ErrorHandler v-if="channel && channel.error" :message="channel.message" :error="channel.error" />

    <div v-if="channel" v-show="!channel.error">
        <div class="flex justify-center place-items-center">
            <img height="48" width="48" class="rounded-full m-1" :src="channel.avatarUrl" />
            <h1 v-text="channel.name" />
            <font-awesome-icon class="ml-1.5 !text-3xl" v-if="channel.verified" icon="check" />
        </div>
        <img v-if="channel.bannerUrl" :src="channel.bannerUrl" class="w-full pb-1.5" loading="lazy" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="whitespace-pre-wrap">
            <span v-html="purifyHTML(urlify(channel.description))" />
        </p>

        <button
            class="btn"
            @click="subscribeHandler"
            v-t="{
                path: `actions.${subscribed ? 'unsubscribe' : 'subscribe'}`,
                args: { count: numberFormat(channel.subscriberCount) },
            }"
        ></button>

        <!-- RSS Feed button -->
        <a
            aria-label="RSS feed"
            title="RSS feed"
            role="button"
            v-if="channel.id"
            :href="`${apiUrl()}/feed/unauthenticated/rss?channels=${channel.id}`"
            target="_blank"
            class="btn flex-col ml-3"
        >
            <font-awesome-icon icon="rss" />
        </a>

        <hr />

        <div class="video-grid">
            <VideoItem
                v-for="video in channel.relatedStreams"
                :key="video.url"
                :video="video"
                height="94"
                width="168"
                hide-channel
            />
        </div>
    </div>
</template>

<script>
import ErrorHandler from "./ErrorHandler.vue";
import VideoItem from "./VideoItem.vue";

export default {
    components: {
        ErrorHandler,
        VideoItem,
    },
    data() {
        return {
            channel: null,
            subscribed: false,
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
            if (!this.authenticated) {
                this.subscribed = this.isSubscribedLocally(this.channel.id);
                return;
            }

            this.fetchJson(
                this.authApiUrl() + "/subscribed",
                {
                    channelId: this.channel.id,
                },
                {
                    headers: {
                        Authorization: this.getAuthToken(),
                    },
                },
            ).then(json => {
                this.subscribed = json.subscribed;
            });
        },
        async fetchChannel() {
            const url = this.apiUrl() + "/" + this.$route.params.path + "/" + this.$route.params.channelId;
            return await this.fetchJson(url);
        },
        async getChannelData() {
            this.fetchChannel()
                .then(data => (this.channel = data))
                .then(() => {
                    if (!this.channel.error) {
                        document.title = this.channel.name + " - Piped";
                        this.fetchSubscribedStatus();
                        this.updateWatched(this.channel.relatedStreams);
                    }
                });
        },
        handleScroll() {
            if (this.loading || !this.channel || !this.channel.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(this.apiUrl() + "/nextpage/channel/" + this.channel.id, {
                    nextpage: this.channel.nextpage,
                }).then(json => {
                    this.channel.nextpage = json.nextpage;
                    this.loading = false;
                    this.updateWatched(json.relatedStreams);
                    json.relatedStreams.map(stream => this.channel.relatedStreams.push(stream));
                });
            }
        },
        subscribeHandler() {
            if (this.authenticated) {
                this.fetchJson(this.authApiUrl() + (this.subscribed ? "/unsubscribe" : "/subscribe"), null, {
                    method: "POST",
                    body: JSON.stringify({
                        channelId: this.channel.id,
                    }),
                    headers: {
                        Authorization: this.getAuthToken(),
                        "Content-Type": "application/json",
                    },
                });
            } else {
                this.handleLocalSubscriptions(this.channel.id);
            }
            this.subscribed = !this.subscribed;
        },
    },
};
</script>
