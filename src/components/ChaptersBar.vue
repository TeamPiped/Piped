<template>
    <!-- desktop view -->
    <div v-if="!mobileLayout" class="max-h-75vh max-w-35vw min-h-64 flex-col overflow-y-scroll lt-lg:hidden">
        <h2 class="mb-2 bg-gray-500/50 p-2" aria-label="chapters" title="chapters">
            {{ $t("video.chapters") }} ({{ chapters.length }})
        </h2>
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter-vertical"
            :class="{ 'bg-red-500/50': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <div class="flex">
                <span class="mr-2 mt-5 text-current" v-text="index + 1" />
                <img class="shrink-0" :src="chapter.image" :alt="chapter.title" />
                <div class="m-2 flex flex-col">
                    <span class="text-sm" :title="chapter.title" v-text="chapter.title" />
                    <span class="text-sm text-blue-500 font-bold" v-text="timeFormat(chapter.start)" />
                </div>
            </div>
        </div>
    </div>

    <!-- mobile vertical view -->
    <div
        v-if="mobileLayout && getPreferenceString('mobileChapterLayout') == 'Vertical'"
        class="max-h-64 flex flex-col overflow-y-scroll"
    >
        <h2 class="mb-2 bg-gray-500/50 p-2" aria-label="chapters" title="chapters">
            {{ $t("video.chapters") }} ({{ chapters.length }})
        </h2>
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter-vertical"
            :class="{ 'bg-red-500/50': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <div class="flex">
                <span class="mr-2 mt-5 text-current" v-text="index + 1" />
                <img class="shrink-0" :src="chapter.image" :alt="chapter.title" />
                <div class="m-2 flex flex-col">
                    <span class="text-sm" :title="chapter.title" v-text="chapter.title" />
                    <span class="text-sm text-blue-500 font-bold" v-text="timeFormat(chapter.start)" />
                </div>
            </div>
        </div>
    </div>
    <!-- mobile Horizontal view -->
    <div v-if="getPreferenceString('mobileChapterLayout') == 'Horizontal' && mobileLayout" class="flex overflow-x-auto">
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter"
            :class="{ 'bg-red-500/50': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <img :src="chapter.image" :alt="chapter.title" />
            <div class="m-1 flex">
                <span class="text-truncate text-sm" :title="chapter.title" v-text="chapter.title" />
                <span class="px-1 text-sm text-blue-500 font-bold" v-text="timeFormat(chapter.start)" />
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    chapters: {
        type: Object,
        default: () => null,
    },
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
