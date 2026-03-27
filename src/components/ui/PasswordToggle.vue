<template>
    <button
        type="button"
        class="ml-2 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
        @click="$emit('update:modelValue', !modelValue)"
    >
        <i-fa6-solid-eye v-if="!modelValue" />
        <i-fa6-solid-eye-slash v-else />
    </button>
</template>

<script setup>
defineProps({
    modelValue: {
        type: Boolean,
        required: true,
    },
});

defineEmits(["update:modelValue"]);
</script>
