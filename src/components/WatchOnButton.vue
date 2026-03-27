<script setup>
import { getPreferenceBoolean } from "@/composables/usePreferences.js";

defineProps({
    link: {
        type: String,
        required: true,
    },
    platform: {
        type: String,
        required: false,
        default: "YouTube",
    },
});
</script>

<template>
    <template v-if="getPreferenceBoolean('showWatchOnYouTube', false)">
        <!-- For large screens -->
        <a
            :href="link"
            class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-lg:hidden max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
        >
            <i18n-t keypath="player.watch_on" tag="strong">{{ platform }}</i18n-t>
            <i-fa6-brands-youtube v-if="platform == 'YouTube'" class="mx-1.5" />
            <i-fa6-brands-odysee v-else-if="platform == 'Odysee'" class="mx-1.5" />
        </a>
        <!-- For small screens -->
        <a
            :href="link"
            class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 lg:hidden dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
        >
            <i-fa6-brands-youtube v-if="platform == 'YouTube'" class="mx-1.5" />
            <i-fa6-brands-odysee v-else-if="platform == 'Odysee'" class="mx-1.5" />
        </a>
    </template>
</template>
