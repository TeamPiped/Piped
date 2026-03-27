<template>
    <div class="fixed top-0 left-0 z-50 table size-full bg-gray-500/80 transition-opacity dark:bg-dark-900/80">
        <div class="table-cell align-middle" @click="handleClick">
            <div class="relative m-auto w-min min-w-[20vw] rounded-xl bg-white p-5 dark:bg-dark-700">
                <button class="absolute top-1 right-2.5" @click="$emit('close')"><i-fa6-solid-xmark /></button>
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
