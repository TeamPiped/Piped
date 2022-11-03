<script>
export default {
    props: {
        link: String,
    },
};
</script>

<template>
    <!-- For large screens -->
    <a :href="link" v-if="this.getPreferenceBoolean('showWatchOnYouTube', false)" class="btn lt-lg:hidden">
        <i18n-t keypath="player.watch_on" tag="strong">
            <font-awesome-icon class="mx-1.5" :icon="['fab', 'youtube']" />
        </i18n-t>
    </a>
    <!-- For small screens -->
    <a :href="link" v-if="this.getPreferenceBoolean('showWatchOnYouTube', false)" class="btn lg:hidden">
        <font-awesome-icon class="mx-1.5" :icon="['fab', 'youtube']" />
    </a>
</template>
