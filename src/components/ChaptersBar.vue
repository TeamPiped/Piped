<template>
    <!-- desktop view -->
    <div v-if="!mobileLayout" class="flex-col overflow-y-scroll max-h-75vh min-h-64 <lg:hidden">
        <h2 v-t="'video.chapters'" class="mb-2 bg-gray-500/50 p-2" />
        <div
            :key="chapter.start"
            v-for="chapter in chapters"
            @click="$emit('seek', chapter.start)"
            class="chapter-vertical"
        >
            <div class="flex">
                <img :src="chapter.image" :alt="chapter.title" />
                <div class="flex flex-col m-2">
                    <span class="text-truncate text-sm" :title="chapter.title" v-text="chapter.title" />
                    <span class="text-sm font-bold text-blue-500" v-text="timeFormat(chapter.start)" />
                </div>
            </div>
        </div>
    </div>
    <!-- mobile view -->
    <div v-else class="flex overflow-x-auto">
        <div :key="chapter.start" v-for="chapter in chapters" @click="$emit('seek', chapter.start)" class="chapter">
            <img :src="chapter.image" :alt="chapter.title" class="" />
            <div class="m-1 flex">
                <span class="text-truncate text-sm" :title="chapter.title" v-text="chapter.title" />
                <span class="text-sm font-bold text-blue-500" v-text="timeFormat(chapter.start)" />
            </div>
        </div>
    </div>
</template>

<style>
::-webkit-scrollbar {
    height: 5px;
}
.chapter {
    @apply cursor-pointer;
    align-self: center;
    padding: 10px;
    img {
        width: 100%;
        height: 100%;
    }
}
.chapter-vertical {
    @apply cursor-pointer;
    align-self: center;
    padding: 10px;
    img {
        width: 30%;
        height: 30%;
    }
}
.chapter-vertical:hover {
    @apply bg-gray-500;
}
.text-truncate {
    white-space: nowrap;
    width: 10em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
}
</style>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
    chapters: Object,
    mobileLayout: {
        type: Boolean,
        default: () => true,
    },
});

defineEmits(["seek"]);
</script>
