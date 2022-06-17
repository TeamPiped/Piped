<template>
    <!-- <h2 v-t="'video.chapters'" class="mb-5" /> -->
    <div class="flex overflow-x-auto">
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
});

defineEmits(["seek"]);
</script>
