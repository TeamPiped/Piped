<template>
    <div class="flex flex-col flex-justify-between">
        <router-link :to="item.url">
            <div class="my-4 flex justify-center">
                <img loading="lazy" class="aspect-square w-[50%] rounded-full" :src="item.thumbnail" />
            </div>
            <p>
                <span v-text="item.name" />
                <i v-if="item.verified" class="i-fa6-solid:check ml-1.5" />
            </p>
        </router-link>
        <p v-if="item.description" v-text="item.description" />
        <router-link v-if="item.uploaderUrl" class="link" :to="item.uploaderUrl">
            <p>
                <span v-text="item.uploader" />
                <i v-if="item.uploaderVerified" class="i-fa6-solid:check ml-1.5" />
            </p>
        </router-link>

        <a v-if="item.uploaderName" class="link" v-text="item.uploaderName" />
        <template v-if="item.videos >= 0">
            <br v-if="item.uploaderName" />
            <strong v-text="`${item.videos} ${$t('video.videos')}`" />
        </template>

        <button
            v-if="subscribed != null"
            class="btn mt-2 w-max"
            @click="subscribeHandler"
            v-text="
                $t('actions.' + (subscribed ? 'unsubscribe' : 'subscribe')) + ' - ' + numberFormat(item.subscribers)
            "
        />

        <br />
    </div>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            subscribed: null,
        };
    },
    computed: {
        channelId(_this) {
            return _this.item.url.substr(-24);
        },
    },
    mounted() {
        this.updateSubscribedStatus();
    },
    methods: {
        async updateSubscribedStatus() {
            this.subscribed = await this.fetchSubscriptionStatus(this.channelId);
            console.log(this.subscribed);
        },
        subscribeHandler() {
            this.toggleSubscriptionState(this.channelId, this.subscribed).then(success => {
                if (success) this.subscribed = !this.subscribed;
            });
        },
    },
};
</script>
