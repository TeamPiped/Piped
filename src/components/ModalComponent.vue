<template>
    <div class="modal">
        <div>
            <div class="modal-container">
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
    },
};
</script>

<style scoped>
.modal {
    @apply fixed z-50 top-0 left-0 w-full h-full bg-dark-900 bg-opacity-80 transition-opacity table;
}

.modal > div {
    @apply table-cell align-middle;
}

.modal-container {
    @apply w-min m-auto min-w-[20vw];
}
</style>
