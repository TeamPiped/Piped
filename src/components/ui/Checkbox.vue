<template>
    <CheckboxRoot
        :id="id"
        :model-value="modelValue"
        :disabled="disabled"
        :class="[
            'inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-gray-500 bg-gray-300 text-white outline-none focus:shadow-red-400 focus:outline-2 focus:outline-red-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-red-500 data-[state=checked]:bg-red-500 dark:border-gray-400 dark:bg-dark-400 dark:data-[state=checked]:border-red-400 dark:data-[state=checked]:bg-red-400',
            customClass,
        ]"
        @update:model-value="handleUpdate"
    >
        <CheckboxIndicator class="inline-flex items-center justify-center text-current">
            <i-fa6-solid-check class="size-3" />
        </CheckboxIndicator>
    </CheckboxRoot>
</template>

<script setup>
import { CheckboxRoot, CheckboxIndicator } from "reka-ui";

defineOptions({
    name: "UiCheckbox",
});

defineProps({
    id: {
        type: String,
        default: undefined,
    },
    modelValue: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    customClass: {
        type: String,
        default: "",
    },
});

const emit = defineEmits(["update:modelValue", "change"]);

function handleUpdate(value) {
    const nextValue = value === true;
    emit("update:modelValue", nextValue);
    emit("change", nextValue);
}
</script>
