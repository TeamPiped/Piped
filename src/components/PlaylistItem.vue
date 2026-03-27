<template>
    <div class="flex flex-col justify-between">
        <router-link
            :to="props.item.url"
            class="inline-block hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
        >
            <div class="relative">
                <img loading="lazy" class="w-full" :src="props.item.thumbnail" />
            </div>
            <p class="line-clamp-2 pt-2 leading-tight font-bold" :title="props.item.name" v-text="props.item.name" />
        </router-link>
        <p
            v-if="props.item.description"
            class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
            v-text="props.item.description"
        />

        <router-link
            v-if="props.item.uploaderUrl"
            class="mt-1 line-clamp-1 block text-sm underline decoration-dark-400 hover:text-dark-400 focus:text-dark-400 dark:text-gray-300 dark:decoration-dark-100 dark:hover:text-gray-400"
            :to="props.item.uploaderUrl"
        >
            <p class="leading-tight">
                <span v-text="props.item.uploaderName" />
                <i-fa6-solid-check v-if="props.item.uploaderVerified" class="ml-1.5" />
            </p>
        </router-link>
        <a
            v-else-if="props.item.uploaderName"
            class="mt-1 line-clamp-1 block text-sm hover:text-red-500 focus:text-red-500 dark:text-gray-300 dark:hover:text-red-400 dark:focus:text-red-400"
            v-text="props.item.uploaderName"
        />

        <template v-if="props.item.videos >= 0">
            <span
                class="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                v-text="`${props.item.videos} ${$t('video.videos')}`"
            />
        </template>
    </div>
</template>

<script setup>
const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});
</script>
