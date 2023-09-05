<template>
    <!-- desktop view -->
    <div v-if="!mobileLayout" class="pp-chapters flex-col overflow-y-scroll max-h-75vh min-h-64 lt-lg:hidden">
        <h6 aria-label="chapters" title="chapters" class="efy_trans_filter">
            {{ $t("video.chapters") }} - {{ chapters.length }}
        </h6>
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter efy_anim_pulse efy_trans_filter"
            :class="{ 'pp-chapter-active': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <div class="flex">
                <img :src="chapter.image" :alt="chapter.title" />
                <div class="flex flex-col m-2">
                    <span :title="chapter.title" v-text="index + 1 + '. ' + chapter.title" class="font-bold" />
                    <span class="font-bold" v-text="timeFormat(chapter.start)" />
                </div>
            </div>
        </div>
    </div>
    <!-- mobile view -->
    <div v-else class="pp-chapters pp-mobile flex overflow-x-auto">
        <div
            v-for="(chapter, index) in chapters"
            :key="chapter.start"
            class="chapter efy_anim_pulse efy_trans_filter"
            :class="{ 'pp-chapter-active': isCurrentChapter(index) }"
            @click="$emit('seek', chapter.start)"
        >
            <img :src="chapter.image" :alt="chapter.title" />
            <div class="m-1 flex">
                <span class="text-truncate font-bold" :title="chapter.title" v-text="chapter.title" />
                <span class="px-1 font-bold" v-text="timeFormat(chapter.start)" />
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
.chapter {
    @apply cursor-pointer self-center p-2.5;
}
.pp-mobile .chapter img {
    @apply w-full h-full;
}
.chapter img {
    @apply w-3/10 h-3/10;
}
.text-truncate {
    @apply truncate overflow-hidden inline-block w-10em;
}
.pp-chapter-active,
.pp-chapters .chapter:hover {
    background: var(--efy_color);
    background-clip: padding-box;
    color: var(--efy_text2);
}
</style>
