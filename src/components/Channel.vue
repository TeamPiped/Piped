<template>
<div v-if="channel">
    <h1 class="uk-text-center"><img v-bind:src="channel.avatarUrl">{{ channel.name }}</h1>
    <img v-bind:src="channel.bannerUrl" style="width: 100%">
    <p v-html="this.channel.description.replaceAll('\n', '<br>')"></p>
    <div class="" style="width: 100%" uk-grid="parallax: 0">
        <div style="width: 260px" v-bind:key="item.url" v-for="item in this.channel.relatedStreams">
            <router-link class="uk-link-muted" v-bind:to="item.url || '/'">
                <img style="width: 100%" v-bind:src="item.thumbnail">
                <p>{{ item.title }}</p>
            </router-link>
            {{ timeFormat(item.duration) }}
        </div>
    </div>
</div>
</template>

<script>
import Constants from "@/Constants.js";

export default {
    data() {
        return {
            channel: null,
        }
    },
    mounted() {
        this.getChannelData()
    },
    methods: {
        async fetchChannel() {
            return await (
                await fetch(Constants.BASE_URL + "/channels/" + this.$route.params.channelId)
            ).json();
        },
        async getChannelData() {
            this.fetchChannel().then(data => this.channel = data)
        },
        timeFormat(duration) {

            var pad = function (num, size) {
                return ('000' + num).slice(size * -1);
            }

            var time = parseFloat(duration).toFixed(3),
                hours = Math.floor(time / 60 / 60),
                minutes = Math.floor(time / 60) % 60,
                seconds = Math.floor(time - minutes * 60);

            var str = "";

            if (hours > 0)
                str += pad(hours, 2) + ":"

            str += pad(minutes, 2) + ':' + pad(seconds, 2)

            return str;

        }
    }
}
</script>
