<template>
    <div class="flex flex-col justify-between">
        <router-link
            :to="item.url"
            class="font-bold hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
        >
            <div class="my-4 flex justify-center">
                <img loading="lazy" class="aspect-square w-[50%] rounded-full" :src="item.thumbnail" />
            </div>
            <p class="line-clamp-2 leading-tight">
                <span v-text="item.name" />
                <i-fa6-solid-check v-if="item.verified" class="ml-1.5" />
            </p>
        </router-link>
        <p
            v-if="item.description"
            class="line-clamp-2 pt-1 text-sm text-gray-600 dark:text-gray-400"
            v-text="item.description"
        />
        <router-link
            v-if="item.uploaderUrl"
            class="mt-1 line-clamp-1 block text-sm underline decoration-dark-400 hover:text-dark-400 focus:text-dark-400 dark:text-gray-300 dark:decoration-dark-100 dark:hover:text-gray-400"
            :to="item.uploaderUrl"
        >
            <p class="leading-tight">
                <span v-text="item.uploader" />
                <i-fa6-solid-check v-if="item.uploaderVerified" class="ml-1.5" />
            </p>
        </router-link>

        <a
            v-if="item.uploaderName"
            class="mt-1 line-clamp-1 block text-sm hover:text-red-500 focus:text-red-500 dark:text-gray-300 dark:hover:text-red-400 dark:focus:text-red-400"
            v-text="item.uploaderName"
        />
        <template v-if="item.videos >= 0">
            <strong
                class="mt-1 text-sm text-gray-800 dark:text-gray-200"
                v-text="`${item.videos} ${$t('video.videos')}`"
            />
        </template>

        <button
            v-if="subscribed != null"
            class="mt-2 inline-block w-max cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            @click="subscribeHandler"
            v-text="
                $t('actions.' + (subscribed ? 'unsubscribe' : 'subscribe')) + ' - ' + numberFormat(item.subscribers)
            "
        />
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
