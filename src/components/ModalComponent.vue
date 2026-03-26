<template>
    <div class="modal">
        <div @click="handleClick">
            <div class="modal-container">
                <button @click="$emit('close')"><i class="i-fa6-solid:xmark" /></button>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";

const emit = defineEmits(["close"]);

function handleKeyDown(event) {
    if (event.code === "Escape") {
        emit("close");
    } else return;
    event.preventDefault();
}

function handleClick(event) {
    if (event.target !== event.currentTarget) return;
    emit("close");
}

onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
});
</script>

<style scoped>
.modal {
    @apply fixed z-50 top-0 left-0 w-full h-full bg-gray bg-opacity-80 transition-opacity table;
}
.dark .modal {
    @apply bg-dark-900 bg-opacity-80;
}

.modal > div {
    @apply table-cell align-middle;
}

.modal-container {
    @apply w-min m-auto bg-white p-5 rounded-xl min-w-[20vw] relative;
}
.dark .modal-container {
    @apply bg-dark-700;
}

.modal-container > button {
    @apply absolute right-2.5 top-1;
}
</style>
