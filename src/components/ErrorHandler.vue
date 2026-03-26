<template>
    <p v-text="message" />
    <button v-t="'actions.show_more'" class="btn" @click="toggleTrace" />
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
