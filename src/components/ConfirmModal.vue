<template>
    <ModalComponent @close="$emit('close')">
        <div>
            <h3 class="text-xl" v-text="message" />
            <div class="mt-8 ml-auto flex w-min gap-2">
                <button
                    v-t="'actions.cancel'"
                    class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="$emit('close')"
                />
                <button
                    v-t="'actions.okay'"
                    class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="$emit('confirm')"
                />
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
