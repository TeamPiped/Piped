<template>
    <ErrorHandler v-if="channel && channel.error" :message="channel.message" :error="channel.error" />

    <div v-if="channel" v-show="!channel.error">
        <h1 class="uk-text-center"><img height="48" width="48" v-bind:src="channel.avatarUrl" />{{ channel.name }}</h1>
        <img v-if="channel.bannerUrl" v-bind:src="channel.bannerUrl" style="width: 100%" loading="lazy" />
        <p style="white-space: pre-wrap">{{ channel.description }}</p>

        <hr />

        <div class="uk-grid-xl" uk-grid="parallax: 0">
            <div
                class="uk-width-1-2 uk-width-1-3@m uk-width-1-4@l uk-width-1-5@xl"
                v-bind:key="item.url"
                v-for="item in this.channel.relatedStreams"
            >
                <router-link class="uk-link-muted uk-text-justify" v-bind:to="item.url || '/'">
                    <img height="94" width="168" style="width: 100%" v-bind:src="item.thumbnail" loading="lazy" />
                    <a>{{ item.title }}</a>
                </router-link>
                <br />
                <div>
                    <b class="uk-text-small uk-align-left">
                        <font-awesome-icon icon="eye"></font-awesome-icon>
                        {{ numberFormat(item.views) }} views
                        <br />
                        {{ item.uploadedDate }}
                    </b>
                    <b class="uk-text-small uk-align-right">
                        {{ timeFormat(item.duration) }}
                    </b>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";
import ErrorHandler from "@/components/ErrorHandler.vue";

export default {
    data() {
        return {
            channel: null,
        };
    },
    mounted() {
        this.getChannelData();
        window.addEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
    methods: {
        async fetchChannel() {
            const url =
                Constants.BASE_URL +
                (this.$route.params.channelId
                    ? "/channels/" + this.$route.params.channelId
                    : this.$route.params.channelC
                    ? "/c/" + this.$route.params.channelC
                    : "/user/" + this.$route.params.channelUser);
            return await this.fetchJson(url);
        },
        async getChannelData() {
            this.fetchChannel()
                .then(data => (this.channel = data))
                .then(() => {
                    if (!this.channel.error) document.title = this.channel.name + " - Piped";
                });
        },
        handleScroll() {
            if (this.loading || !this.channel || !this.channel.nextpage) return;
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
                this.loading = true;
                this.fetchJson(
                    Constants.BASE_URL +
                        "/nextpage/channels/" +
                        this.channel.id +
                        "?nextpage=" +
                        encodeURIComponent(this.channel.nextpage),
                ).then(json => {
                    this.channel.relatedStreams.concat(json.relatedStreams);
                    this.channel.nextpage = json.nextpage;
                    this.loading = false;
                    json.relatedStreams.map(stream => this.channel.relatedStreams.push(stream));
                });
            }
        },
    },
    components: {
        ErrorHandler,
    },
};
</script>
