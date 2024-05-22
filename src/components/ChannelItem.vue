<template>
    <div class="efy_trans_filter efy_shadow_trans flex flex-col">
        <router-link
            :to="item.url"
            class="flex items-center gap-[10rem] p-[10rem]"
            style="border-bottom: var(--efy_border)"
        >
            <img
                class="efy_shadow_trans"
                style="border-radius: var(--efy_radius); width: 40rem; aspect-ratio: 1"
                :src="item.thumbnail"
                loading="lazy"
                width="40"
                height="40"
            />
            <div class="pp-text flex items-center overflow-hidden">
                <p class="pp-video-card-title p-0!" v-text="item.name" />
                <i v-if="item.verified" class="i-fa6-solid:check ml-1.5" />
            </div>
        </router-link>

        <div style="padding: 10rem">
            <p v-if="item.description" v-text="item.description" />
            <div v-if="item.videos >= 0" v-text="`${item.videos} ${$t('video.videos')}`" />
        </div>

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
