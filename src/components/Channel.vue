<template>
    <div v-if="channel">
        <h1 class="uk-text-center">
            <img v-bind:src="channel.avatarUrl" />{{ channel.name }}
        </h1>
        <img
            v-if="channel.bannerUrl"
            v-bind:src="channel.bannerUrl"
            style="width: 100%"
        />
        <p v-html="this.channel.description.replaceAll('\n', '<br>')"></p>

        <hr />

        <div class="uk-grid-xl" uk-grid="parallax: 0">
            <div
                class="uk-width-1-2 uk-width-1-3@m uk-width-1-4@l uk-width-1-5@xl"
                v-bind:key="item.url"
                v-for="item in this.channel.relatedStreams"
            >
                <router-link
                    class="uk-link-muted uk-text-justify"
                    v-bind:to="item.url || '/'"
                >
                    <img style="width: 100%" v-bind:src="item.thumbnail" />
                    <a>{{ item.title }}</a>
                </router-link>
                <br />
                <div>
                    <b class="uk-text-small uk-align-left">
                        {{ timeFormat(item.duration) }}
                    </b>
                    <b class="uk-text-small uk-align-right">
                        <font-awesome-icon icon="eye"></font-awesome-icon>
                        {{ item.views }} views
                    </b>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";

export default {
    data() {
        return {
            channel: null
        };
    },
    mounted() {
        this.getChannelData();
    },
    methods: {
        async fetchChannel() {
            return await (
                await fetch(
                    Constants.BASE_URL +
                        "/channels/" +
                        this.$route.params.channelId
                )
            ).json();
        },
        async getChannelData() {
            this.fetchChannel()
                .then(data => (this.channel = data))
                .then(() => (document.title = this.channel.name + " - Piped"));
        },
        timeFormat(d) {
            return require("@/utils/TimeUtils.js").default.timeFormat(d);
        }
    }
};
</script>
