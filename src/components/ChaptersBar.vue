<template>
    <!-- desktop view -->
    <div v-if="!mobileLayout" class="flex-col overflow-y-scroll max-h-75vh min-h-64 lt-lg:hidden">
        <h2 class="mb-2 bg-gray-500/50 p-2" aria-label="chapters" title="chapters">
            {{ $t("video.chapters") }} ({{ chapters.length }})
        </h2>
        <div
            :key="chapter.start"
            v-for="(chapter, index) in chapters"
            @click="$emit('seek', chapter.start)"
            class="chapter-vertical"
            :class="{ 'bg-red-500/50': isCurrentChapter(index) }"
        >
            <div class="flex">
                <span class="mt-5 mr-2 text-current" v-text="index + 1" />
                <img :src="chapter.image" :alt="chapter.title" />
                <div class="flex flex-col m-2">
                    <span class="text-sm" :title="chapter.title" v-text="chapter.title" />
                    <span class="text-sm font-bold text-blue-500" v-text="timeFormat(chapter.start)" />
                </div>
            </div>
        </div>
    </div>
    <!-- mobile view -->
    <div v-else class="flex overflow-x-auto">
        <div
            :key="chapter.start"
            v-for="(chapter, index) in chapters"
            @click="$emit('seek', chapter.start)"
            class="chapter"
            :class="{ 'bg-red-500/50': isCurrentChapter(index) }"
        >
            <img :src="chapter.image" :alt="chapter.title" />
            <div class="m-1 flex">
                <span class="text-truncate text-sm" :title="chapter.title" v-text="chapter.title" />
                <span class="px-1 text-sm font-bold text-blue-500" v-text="timeFormat(chapter.start)" />
            </div>
        </div>
    </div>
</template>

<style>
::-webkit-scrollbar {
    height: 5px;
}
.chapter {
    @apply cursor-pointer self-center p-2.5;
}
.chapter img {
    @apply w-full h-full;
}
.chapter-vertical {
    @apply cursor-pointer self-center p-2.5;
}
.chapter-vertical img {
    @apply w-3/10 h-3/10;
}

.chapter-vertical:hover {
    @apply bg-gray-500;
}
.text-truncate {
    @apply truncate overflow-hidden inline-block w-10em;
}
</style>

<script setup>
const props = defineProps({
    chapters: Object,
    mobileLayout: {
        type: Boolean,
        default: () => true,
    },
    playerPosition: {
        type: Number,
        default: () => 0,
    },
});

const isCurrentChapter = index => {
    return (
        props.playerPosition >= props.chapters[index].start &&
        props.playerPosition < (props.chapters[index + 1]?.start ?? Infinity)
    );
};

defineEmits(["seek"]);
</script>
