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

<script setup>
import { onMounted, onUnmounted } from "vue";
import ModalComponent from "./ModalComponent.vue";

defineProps({
    message: {
        type: String,
        required: true,
    },
});

const emit = defineEmits(["close", "confirm"]);

function handleKeyDown(event) {
    if (event.code === "Enter") {
        emit("confirm");
        event.preventDefault();
    }
}

onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
});
</script>
