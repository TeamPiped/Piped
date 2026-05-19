<template>
    <router-link
        :to="to"
        class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors"
        :class="
            isActive
                ? 'bg-red-50 font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700'
        "
        :title="collapsed ? label : undefined"
    >
        <component :is="icon" class="size-4 shrink-0" />
        <span v-if="!collapsed" class="flex-1 truncate">{{ label }}</span>
        <span
            v-if="!collapsed && badge != null"
            class="ml-auto flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white"
        >
            {{ badge }}
        </span>
    </router-link>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
    to: { type: String, required: true },
    collapsed: { type: Boolean, default: false },
    icon: { type: Object, required: true },
    label: { type: String, required: true },
    badge: { type: Number, default: null },
});

const route = useRoute();
const isActive = computed(() => route.path === props.to || route.path.startsWith(props.to + "/"));
</script>
