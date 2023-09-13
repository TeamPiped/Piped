<template>
    <div class="toast">
        <slot />
        <button v-t="'actions.dismiss'" @click="dismiss" class="m-0 mt-[10rem]" />
    </div>
</template>

<script>
export default {
    emits: ["dismissed"],
    methods: {
        dismiss() {
            this.$emit("dismissed");
        },
    },
};
</script>

<style>
.toast {
    @apply flex flex-col justify-center fixed top-[15rem] right-[15rem] min-w-max z-9999;
    background: var(--efy_text2);
    color: var(--efy_text);
    padding: 15rem;
    border-radius: var(--efy_radius);
    border: var(--efy_border);
}
</style>
