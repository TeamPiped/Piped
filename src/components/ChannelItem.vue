<template>
    <div class="flex flex-col flex-justify-between">
        <router-link :to="item.url" class="link font-bold">
            <div class="my-4 flex justify-center">
                <img loading="lazy" class="aspect-square w-[50%] rounded-full" :src="item.thumbnail" />
            </div>
            <p>
                <span v-text="item.name" />
                <i v-if="item.verified" class="i-fa6-solid:check ml-1.5" />
            </p>
        </router-link>
        <p v-if="item.description" class="pt-1 text-sm" v-text="item.description" />
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

<script setup>
import { ref, computed, onMounted } from "vue";
import { fetchSubscriptionStatus, toggleSubscriptionState } from "@/composables/useSubscriptions.js";
import { numberFormat } from "@/composables/useFormatting.js";

const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});

const subscribed = ref(null);

const channelId = computed(() => props.item.url.substr(-24));

async function updateSubscribedStatus() {
    subscribed.value = await fetchSubscriptionStatus(channelId.value);
    console.log(subscribed.value);
}

function subscribeHandler() {
    toggleSubscriptionState(channelId.value, subscribed.value).then(success => {
        if (success) subscribed.value = !subscribed.value;
    });
}

onMounted(() => {
    updateSubscribedStatus();
});
</script>
