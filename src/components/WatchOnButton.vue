<script>
export default {
    props: {
        link: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            required: false,
            default: "YouTube",
        },
    },
};
</script>

<template>
    <template v-if="getPreferenceBoolean('showWatchOnYouTube', false)">
        <!-- For large screens -->
        <a :href="link" class="btn flex items-center lt-lg:hidden">
            <i18n-t keypath="player.watch_on" tag="strong">{{ platform }}</i18n-t>
            <font-awesome-icon class="mx-1.5" :icon="['fab', platform.toLowerCase()]" />
        </a>
        <!-- For small screens -->
        <a :href="link" class="btn flex items-center lg:hidden">
            <font-awesome-icon class="mx-1.5" :icon="['fab', platform.toLowerCase()]" />
        </a>
    </template>
</template>
