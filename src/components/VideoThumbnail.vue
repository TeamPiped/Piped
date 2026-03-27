<template>
    <div class="relative w-full">
        <img
            loading="lazy"
            class="aspect-video w-full rounded-md object-contain"
            :src="item.thumbnail"
            :alt="item.title"
            :class="{ 'w-full object-contain': item.isShort, 'opacity-75': item.watched }"
        />
        <!-- progress bar -->
        <div class="relative h-1 w-full">
            <div
                v-if="item.watched && item.duration > 0"
                class="absolute bottom-0 left-0 h-1 bg-red-600"
                :style="{ width: `clamp(0%, ${(item.currentTime / item.duration) * 100}%, 100%` }"
            />
        </div>
        <!-- shorts thumbnail -->
        <span
            v-if="item.isShort"
            v-t="'video.shorts'"
            class="absolute bottom-1.25 left-1.25 rounded-md bg-red-600 px-1.25 text-xs font-bold text-white uppercase"
        />
        <span
            v-if="item.duration > 0 || (item.duration == 0 && item.isShort)"
            class="absolute right-1.25 bottom-1.25 rounded-md bg-black/75 px-0.5 text-white"
            :class="small ? 'text-xs' : 'text-sm'"
            v-text="timeFormat(item.duration)"
        />
        <i18n-t
            v-else
            keypath="video.live"
            class="absolute right-1.25 bottom-1.25 inline-flex items-center gap-1 rounded-md bg-red-600 px-1.25 text-white"
            :class="small ? 'text-xs' : 'text-sm'"
            tag="div"
        >
            <i-fa6-solid-tower-broadcast class="w-3" />
        </i18n-t>
        <span
            v-if="item.watched"
            v-t="'video.watched'"
            class="absolute bottom-1.25 left-1.25 rounded-md bg-black/75 px-1.25 text-white"
            :class="small ? 'text-xs' : 'text-sm'"
        />
    </div>
</template>
<script setup>
import { timeFormat } from "@/composables/useFormatting.js";

defineProps({
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
});
</script>
