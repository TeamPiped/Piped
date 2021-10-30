<template>
    <ErrorHandler v-if="channel && channel.error" :message="channel.message" :error="channel.error" />

    <div v-if="channel" v-show="!channel.error">
        <h1 class="uk-text-center">
            <img height="48" width="48" class="uk-border-circle" :src="channel.avatarUrl" />{{ channel.name }}
        </h1>
        <img v-if="channel.bannerUrl" :src="channel.bannerUrl" style="width: 100%" loading="lazy" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p style="white-space: pre-wrap"><span v-html="purifyHTML(urlify(channel.description))"></span></p>

        <button
            v-if="authenticated"
            class="uk-button uk-button-small"
            style="background: #222"
            type="button"
            @click="subscribeHandler"
        >
            {{ subscribed ? $t("actions.unsubscribe") : $t("actions.subscribe") }}
        </button>

        <hr />

        <div class="uk-grid-xl" uk-grid="parallax: 0" style="padding-left: 25px;">
            <div
                v-for="video in channel.relatedStreams"
                :key="video.url"
                style="padding-left: 15px;"
                class="uk-width-1-2 uk-width-1-3@m uk-width-1-4@l uk-width-1-5@xl"
            >
                <VideoItem :video="video" height="94" width="168" hide-channel />
            </div>
        </div>
    </div>
</template>

<script>
import ErrorHandler from "@/components/ErrorHandler.vue";
import VideoItem from "@/components/VideoItem.vue";

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
        document.getElementsByTagName("main")[0].addEventListener("scroll", this.handleScroll);
        if (this.channel && !this.channel.error) this.updateWatched(this.channel.relatedStreams);
    },
    deactivated() {
        document.getElementsByTagName("main")[0].removeEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        document.getElementsByTagName("main")[0].removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchSubscribedStatus() {
            this.fetchJson(
                this.apiUrl() + "/subscribed",
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
                        if (this.authenticated) this.fetchSubscribedStatus();
                        this.updateWatched(this.channel.relatedStreams);
                    }
                });
        },
        handleScroll() {
            if (this.loading || !this.channel || !this.channel.nextpage) return;
            var mainElem = document.getElementsByTagName("main")[0];
            if (mainElem.offsetHeight + mainElem.scrollTop >= mainElem.scrollHeight - mainElem.clientHeight) {
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
            this.fetchJson(this.apiUrl() + (this.subscribed ? "/unsubscribe" : "/subscribe"), null, {
                method: "POST",
                body: JSON.stringify({
                    channelId: this.channel.id,
                }),
                headers: {
                    Authorization: this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            });
            this.subscribed = !this.subscribed;

            var notifText;
            if (this.subscribed) {
                notifText = this.$t("notifications.notif_subscribe");
            } else {
                notifText = this.$t("notifications.notif_unsubscribe");
            }

            this.$notify({
                text: notifText,
                type: "success",
            });
        },
    },
};
</script>
