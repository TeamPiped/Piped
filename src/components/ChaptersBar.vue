<template>
    <h2 v-t="'video.chapters'" />
    <div :key="chapter.start" v-for="chapter in chapters" @click="$emit('seek', chapter.start)" class="chapter">
        <img :src="chapter.image" :alt="chapter.title" class="h-12" />
        <div class="ml-1">
            <span class="text-xl" v-text="chapter.title" />
            <br />
            <span class="text-sm" v-text="timeFormat(chapter.start)" />
        </div>
    </div>
</template>

<style>
.chapter {
    @apply flex items-center mb-2 cursor-pointer w-sm max-w-90vw;
}
</style>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
    chapters: Object,
});

defineEmits(["seek"]);
</script>
