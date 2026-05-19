<template>
    <router-link
        :to="to"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
        :class="
            isActive
                ? 'bg-red-50 font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-700'
        "
    >
        <slot />
        <span>{{ label }}</span>
    </router-link>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
    to: { type: String, required: true },
    label: { type: String, required: true },
});

const route = useRoute();
const isActive = computed(() => route.path === props.to || route.path.startsWith(props.to + "/"));
</script>
