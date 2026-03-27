<template>
    <NumberFieldRoot
        :id="id"
        :model-value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        class="inline-flex h-8 items-center rounded-md bg-gray-300 text-gray-700 dark:bg-dark-400 dark:text-gray-300"
        @update:model-value="handleUpdate"
    >
        <NumberFieldDecrement
            class="inline-flex h-full w-8 items-center justify-center rounded-l-md border-r border-gray-400 text-base transition-colors hover:bg-gray-500 hover:text-white focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-300 dark:hover:bg-dark-300"
            aria-label="Decrease value"
        >
            −
        </NumberFieldDecrement>
        <NumberFieldInput
            class="h-full w-16 bg-transparent px-2 text-center text-gray-700 outline-none focus-visible:outline-2 focus-visible:outline-red-500 dark:text-gray-300"
        />
        <NumberFieldIncrement
            class="inline-flex h-full w-8 items-center justify-center rounded-r-md border-l border-gray-400 text-base transition-colors hover:bg-gray-500 hover:text-white focus-visible:outline-2 focus-visible:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-300 dark:hover:bg-dark-300"
            aria-label="Increase value"
        >
            +
        </NumberFieldIncrement>
    </NumberFieldRoot>
</template>

<script setup>
import { NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, NumberFieldRoot } from "reka-ui";

defineProps({
    id: {
        type: String,
        required: true,
    },
    modelValue: {
        type: Number,
        required: true,
    },
    min: {
        type: Number,
        default: undefined,
    },
    max: {
        type: Number,
        default: undefined,
    },
    step: {
        type: Number,
        default: 1,
    },
});

const emit = defineEmits(["update:modelValue", "change"]);

function handleUpdate(value) {
    emit("update:modelValue", value ?? 0);
    emit("change", value ?? 0);
}
</script>
