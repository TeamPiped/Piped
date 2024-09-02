<template>
    <div class="w-full">
        <img
            loading="lazy"
            class="aspect-video w-full object-contain"
            :src="item.thumbnail"
            :alt="item.title"
            :class="{ 'shorts-img': item.isShort, 'opacity-75': item.watched }"
        />
        <!-- progress bar -->
        <div class="relative h-1 w-full">
            <div
                v-if="item.watched && item.duration > 0"
                class="absolute bottom-0 left-0 h-1 bg-red-600"
                :style="{ width: `clamp(0%, ${(item.currentTime / item.duration) * 100}%, 100%` }"
            />
        </div>
    </div>
</template>
<script>
export default {
    props: {
        item: {
            type: Object,
            default: () => {
                return {};
            },
        },
    },
    computed: {
        title() {
            return this.item.dearrow?.titles[0]?.title ?? this.item.title;
        },
        thumbnail() {
            return this.item.dearrow?.thumbnails[0]?.thumbnail ?? this.item.thumbnail;
        },
    },
};
</script>

<style>
.shorts-img {
    @apply w-full object-contain;
}
</style>
