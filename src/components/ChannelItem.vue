<template>
    <div class="flex flex-col efy_trans_filter efy_shadow_trans">
        <router-link
            :to="props.item.url"
            class="flex items-center p-[10rem] gap-[10rem]"
            style="border-bottom: var(--efy_border)"
        >
            <img
                class="efy_shadow_trans"
                style="border-radius: var(--efy_radius); width: 40rem; aspect-ratio: 1"
                :src="props.item.thumbnail"
                loading="lazy"
                width="40"
                height="40"
            />
            <div class="flex items-center overflow-hidden pp-text">
                <p v-text="props.item.name" class="pp-video-card-title p-0!" />
                <font-awesome-icon v-if="props.item.verified" class="ml-1.5" icon="check" />
            </div>
        </router-link>
        <div style="padding: 10rem">
            <p v-if="props.item.description" v-text="props.item.description" />
            <div v-if="props.item.videos >= 0" v-text="`${props.item.videos} ${$t('video.videos')}`" />
        </div>
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
