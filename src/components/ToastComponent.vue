<template>
    <div
        class="fixed top-12 right-12 z-9999 flex min-w-max flex-col justify-center rounded-sm bg-white/80 p-4 text-black shadow-sm duration-200 dark:bg-dark-900/80 dark:text-white"
    >
        <slot />
        <button v-t="'actions.dismiss'" class="underline" @click="dismiss" />
    </div>
</template>

<script setup>
const emit = defineEmits(["dismissed"]);

function dismiss() {
    emit("dismissed");
}
</script>
