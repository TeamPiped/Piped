<template>
    <div class="flex flex-col flex-justify-between">
        <router-link :to="props.item.url" class="link inline-block">
            <div class="relative">
                <img loading="lazy" class="w-full" :src="props.item.thumbnail" />
            </div>
            <p class="link pt-2 font-bold" :title="props.item.name" v-text="props.item.name" />
        </router-link>
        <p v-if="props.item.description" v-text="props.item.description" />

        <router-link v-if="props.item.uploaderUrl" class="link-secondary text-sm" :to="props.item.uploaderUrl">
            <p>
                <span v-text="props.item.uploaderName" />
                <i v-if="props.item.uploaderVerified" class="i-fa6-solid:check ml-1.5" />
            </p>
        </router-link>
        <a v-else-if="props.item.uploaderName" class="link" v-text="props.item.uploaderName" />

        <template v-if="props.item.videos >= 0">
            <br v-if="props.item.uploaderName" />
            <span class="text-sm" v-text="`${props.item.videos} ${$t('video.videos')}`" />
        </template>

        <br />
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
