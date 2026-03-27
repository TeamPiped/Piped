<template>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        :for="forId"
    >
        <slot name="label" />
        <slot />
    </label>
</template>

<script setup>
defineProps({
    forId: {
        type: String,
        required: true,
    },
});
</script>
