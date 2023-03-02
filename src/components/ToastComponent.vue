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
    @apply bg-dark-900/80 text-white flex flex-col justify-center fixed top-12 right-12 p-4 min-w-max shadow rounded duration-200 z-9999;
}
.toast button {
    @apply underline;
}
</style>
