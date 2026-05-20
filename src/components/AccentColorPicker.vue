<template>
    <div>
        <p class="mb-2 text-sm font-medium">{{ $t("preferences.accent_color") }}</p>
        <div class="flex flex-wrap items-center gap-2">
            <button
                v-for="p in presets"
                :key="p"
                class="size-9 rounded-full border-2 transition-transform hover:scale-110"
                :class="color === p ? 'border-gray-900 dark:border-white' : 'border-transparent'"
                :style="{ backgroundColor: p }"
                :title="p"
                @click="setColor(p)"
            />
            <label
                class="flex cursor-pointer items-center gap-2 rounded-md bg-gray-100 px-3 py-1.5 text-sm dark:bg-dark-700"
            >
                <i-fa6-solid-eye-dropper />
                {{ $t("actions.custom") }}
                <input :value="color" type="color" class="sr-only" @input="setColor($event.target.value)" />
            </label>
            <button
                class="text-sm text-gray-500 underline hover:text-gray-900 dark:hover:text-white"
                @click="resetColor"
            >
                {{ $t("actions.reset") }}
            </button>
        </div>
        <p class="mt-2 text-xs text-gray-500">{{ $t("info.accent_hint") }}</p>
    </div>
</template>

<script setup>
import { useTheme } from "@/composables/useTheme.js";

const { color, setColor, resetColor } = useTheme();

const presets = [
    "#fa4b4b", // red (default)
    "#f97316", // orange
    "#eab308", // yellow
    "#22c55e", // green
    "#06b6d4", // cyan
    "#3b82f6", // blue
    "#8b5cf6", // violet
    "#ec4899", // pink
];
</script>
