<template>
    <p v-text="message" />
    <button
        v-t="'actions.show_more'"
        class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
        @click="toggleTrace"
    />
    <p ref="stacktrace" class="whitespace-pre-wrap" hidden v-text="error" />
</template>

<script setup>
import { ref } from "vue";

defineProps({
    error: { type: String, default: null },
    message: { type: String, default: null },
});

const stacktrace = ref(null);

function toggleTrace() {
    stacktrace.value.hidden = !stacktrace.value.hidden;
}
</script>
