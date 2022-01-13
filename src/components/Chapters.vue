<template>
    <h2 v-t="'video.chapters'" />
    <div
        :key="chapter.start"
        v-for="chapter in props.chapters"
        @click="$emit('seek', chapter.start)"
        class="flex items-center mb-2 cursor-pointer w-sm"
    >
        <img :src="chapter.image" :alt="chapter.title" class="h-12" />
        <div class="ml-1">
            <span class="text-xl" v-text="chapter.title" />
            <br />
            <span class="text-sm" v-text="timeFormat(chapter.start)" />
        </div>
    </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
    chapters: Object,
});

defineEmits(["seek"]);
</script>
