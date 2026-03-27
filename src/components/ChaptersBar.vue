<template>
    <!-- desktop view -->
    <div v-if="!mobileLayout" class="max-h-[75vh] min-h-64 max-w-[35vw] flex-col overflow-y-auto max-lg:hidden">
        <h2 class="mb-2 bg-gray-500/50 p-2" aria-label="chapters" title="chapters">
            {{ $t("video.chapters") }} ({{ chapters.length }})
        </h2>
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="cursor-pointer self-center p-2.5 hover:bg-gray-500"
            :class="{ 'bg-red-500/50': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <div class="flex">
                <span class="mt-5 mr-2 text-current" v-text="index + 1" />
                <img class="h-[30%] w-[30%] shrink-0" :src="chapter.image" :alt="chapter.title" />
                <div class="m-2 flex flex-col">
                    <span class="text-sm" :title="chapter.title" v-text="chapter.title" />
                    <span class="text-sm font-bold text-blue-500" v-text="timeFormat(chapter.start)" />
                </div>
            </div>
        </div>
    </div>

    <!-- mobile vertical view -->
    <div
        v-if="mobileLayout && getPreferenceString('mobileChapterLayout') == 'Vertical'"
        class="flex max-h-64 flex-col overflow-y-auto"
    >
        <h2 class="mb-2 bg-gray-500/50 p-2" aria-label="chapters" title="chapters">
            {{ $t("video.chapters") }} ({{ chapters.length }})
        </h2>
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="cursor-pointer self-center p-2.5 hover:bg-gray-500"
            :class="{ 'bg-red-500/50': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <div class="flex">
                <span class="mt-5 mr-2 text-current" v-text="index + 1" />
                <img class="h-[30%] w-[30%] shrink-0" :src="chapter.image" :alt="chapter.title" />
                <div class="m-2 flex flex-col">
                    <span class="text-sm" :title="chapter.title" v-text="chapter.title" />
                    <span class="text-sm font-bold text-blue-500" v-text="timeFormat(chapter.start)" />
                </div>
            </div>
        </div>
    </div>
    <!-- mobile Horizontal view -->
    <div v-if="getPreferenceString('mobileChapterLayout') == 'Horizontal' && mobileLayout" class="flex overflow-x-auto">
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="cursor-pointer self-center p-2.5"
            :class="{ 'bg-red-500/50': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <img class="size-full" :src="chapter.image" :alt="chapter.title" />
            <div class="m-1 flex">
                <span
                    class="inline-block w-[10em] truncate overflow-hidden text-sm"
                    :title="chapter.title"
                    v-text="chapter.title"
                />
                <span class="px-1 text-sm font-bold text-blue-500" v-text="timeFormat(chapter.start)" />
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
@reference "../app.css";

@layer base {
    ::-webkit-scrollbar {
        height: 5px;
    }
}
</style>
