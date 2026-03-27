<template>
    <SwitchRoot
        :id="id"
        :model-value="modelValue"
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-300 transition-colors focus-visible:outline-2 focus-visible:outline-red-500 data-[state=checked]:bg-red-500 dark:bg-dark-400 dark:data-[state=checked]:bg-red-400"
        @update:model-value="handleUpdate"
    >
        <SwitchThumb
            class="pointer-events-none block size-5 translate-x-0 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-5"
        />
    </SwitchRoot>
</template>

<script setup>
import { SwitchRoot, SwitchThumb } from "reka-ui";

defineProps({
    id: {
        type: String,
        required: true,
    },
    modelValue: {
        type: Boolean,
        required: true,
    },
});

const emit = defineEmits(["update:modelValue", "change"]);

function handleUpdate(value) {
    emit("update:modelValue", value);
    emit("change", value);
}
</script>
