<template>
    <div class="w-full">
        <img
            loading="lazy"
            class="aspect-video w-full rounded-md object-contain"
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

    <div class="relative" :class="small ? 'text-xs' : 'text-sm'">
        <!-- shorts thumbnail -->
        <span v-if="item.isShort" v-t="'video.shorts'" class="thumbnail-overlay thumbnail-left" />
        <span
            v-if="item.duration > 0 || (item.duration == 0 && item.isShort)"
            class="thumbnail-overlay thumbnail-right px-0.5"
            v-text="timeFormat(item.duration)"
        />
        <i18n-t v-else keypath="video.live" class="thumbnail-overlay thumbnail-right !bg-red-600" tag="div">
            <i class="i-fa6-solid:tower-broadcast w-3" />
        </i18n-t>
        <span v-if="item.watched" v-t="'video.watched'" class="thumbnail-overlay bottom-5px left-5px" />
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
        small: {
            type: Boolean,
            default: () => {
                return false;
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
