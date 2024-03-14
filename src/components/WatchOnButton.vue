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
            <i v-if="platform == 'YouTube'" class="i-fa6-brands:youtube mx-1.5" />
            <i v-else-if="platform == 'Odysee'" class="i-fa6-brands:odysee mx-1.5" />
        </a>
        <!-- For small screens -->
        <a :href="link" class="btn flex items-center lg:hidden">
            <i v-if="platform == 'YouTube'" class="i-fa6-brands:youtube mx-1.5" />
            <i v-else-if="platform == 'Odysee'" class="i-fa6-brands:odysee mx-1.5" />
        </a>
    </template>
</template>
