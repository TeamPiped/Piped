<template>
    <ListboxRoot
        :id="id"
        :model-value="modelValue"
        multiple
        class="w-52 rounded-md bg-gray-300 text-gray-700 dark:bg-dark-400 dark:text-gray-300"
        @update:model-value="handleUpdate"
    >
        <ListboxContent class="max-h-28 overflow-y-auto rounded-md p-1">
            <ListboxItem
                v-for="option in options"
                :key="option.value"
                :value="option.value"
                class="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm transition-colors outline-none data-highlighted:bg-gray-500 data-highlighted:text-white data-[state=checked]:bg-red-100 data-[state=checked]:text-red-700 dark:data-highlighted:bg-dark-300 dark:data-[state=checked]:bg-red-950/40 dark:data-[state=checked]:text-red-200"
            >
                <span v-text="option.label" />
                <ListboxItemIndicator class="ml-2 text-red-500 dark:text-red-400">✓</ListboxItemIndicator>
            </ListboxItem>
        </ListboxContent>
    </ListboxRoot>
</template>

<script setup>
import { ListboxContent, ListboxItem, ListboxItemIndicator, ListboxRoot } from "reka-ui";

defineProps({
    id: {
        type: String,
        required: true,
    },
    modelValue: {
        type: Array,
        required: true,
    },
    options: {
        type: Array,
        required: true,
    },
});

const emit = defineEmits(["update:modelValue", "change"]);

function handleUpdate(value) {
    emit("update:modelValue", value);
    emit("change", value);
}
</script>
