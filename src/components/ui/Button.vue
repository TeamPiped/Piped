<template>
    <button
        :type="type"
        :class="[
            'inline-block w-auto cursor-pointer rounded-sm py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-sm focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:text-gray-400 dark:hover:bg-dark-300',
            variant === 'primary'
                ? 'bg-gray-300 dark:bg-dark-400'
                : 'border border-gray-500 bg-transparent dark:border-gray-400',
            customClass,
        ]"
        v-bind="$attrs"
    >
        <slot />
    </button>
</template>

<script setup>
defineOptions({
    name: "UiButton",
});

defineProps({
    type: {
        type: String,
        default: "button",
        validator: val => ["button", "submit"].includes(val),
    },
    variant: {
        type: String,
        default: "primary",
        validator: val => ["primary", "secondary"].includes(val),
    },
    customClass: {
        type: String,
        default: "",
    },
});
</script>
