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
        <a
            :href="link"
            role="button"
            class="pp-square flex items-center justify-center"
            :aria-label="'Watch on Odysee'"
            :title="`${$t('player.watch_on')}${platform}`"
        >
            <font-awesome-icon class="mx-1.5" :icon="['fab', platform.toLowerCase()]" />
        </a>
    </template>
</template>
