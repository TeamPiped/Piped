<template>
    <ModalComponent @close="$emit('close')">
        <div>
            <h3 class="text-xl" v-text="message" />
            <div class="ml-auto mt-8 w-min flex gap-2">
                <button v-t="'actions.cancel'" class="btn" @click="$emit('close')" />
                <button v-t="'actions.okay'" class="btn" @click="$emit('confirm')" />
            </div>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ModalComponent,
    },
    props: {
        message: {
            type: String,
            required: true,
        },
    },
    emits: ["close", "confirm"],
    mounted() {
        window.addEventListener("keydown", this.handleKeyDown);
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
            if (event.code === "Enter") {
                this.$emit("confirm");
                event.preventDefault();
            }
        },
    },
};
</script>
