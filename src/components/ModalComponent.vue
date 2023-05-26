<template>
    <div class="modal">
        <div @click="handleClick">
            <div class="modal-container">
                <button @click="$emit('close')"><font-awesome-icon icon="xmark" /></button>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    mounted() {
        window.addEventListener("keydown", this.handleKeyDown);
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
            if (event.code === "Escape") {
                this.$emit("close");
            } else return;
            event.preventDefault();
        },
        handleClick(event) {
            if (event.target !== event.currentTarget) return;
            this.$emit("close");
        },
    },
};
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
