<template>
    <div class="toast">
        <slot />
        <button @click="dismiss" v-t="'actions.dismiss'" />
    </div>
</template>

<script>
export default {
    methods: {
        dismiss() {
            this.$emit("dismissed");
        },
    },
};
</script>

<style>
.toast {
    @apply bg-white/80 text-black flex flex-col justify-center fixed top-12 right-12 p-4 min-w-max shadow rounded duration-200 z-9999;
}
.dark .toast {
    @apply bg-dark-900/80 text-white;
}
.toast button {
    @apply underline;
}
</style>
