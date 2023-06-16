<script>
export default {
    props: {
        link: String,
        platform: {
            type: String,
            required: false,
            default: "YouTube",
        },
    },
};
</script>

<template>
    <template v-if="this.getPreferenceBoolean('showWatchOnYouTube', false)">
        <!-- For large screens -->
        <a :href="link" class="btn lt-lg:hidden flex items-center">
            <i18n-t keypath="player.watch_on" tag="strong">{{ platform }}</i18n-t>
            <font-awesome-icon class="mx-1.5" :icon="['fab', platform.toLowerCase()]" />
        </a>
        <!-- For small screens -->
        <a :href="link" class="btn lg:hidden flex items-center">
            <font-awesome-icon class="mx-1.5" :icon="['fab', platform.toLowerCase()]" />
        </a>
    </template>
</template>
