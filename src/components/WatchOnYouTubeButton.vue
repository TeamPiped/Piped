<script>
export default {
    props: {
        link: String,
    },
};
</script>

<template>
    <template v-if="this.getPreferenceBoolean('showWatchOnYouTube', false)">
        <!-- For large screens -->
        <a :href="link" class="btn lt-lg:hidden">
            <i18n-t keypath="player.watch_on" tag="strong">
                <font-awesome-icon class="mx-1.5" :icon="['fab', 'youtube']" />
            </i18n-t>
        </a>
        <!-- For small screens -->
        <a :href="link" class="btn lg:hidden">
            <font-awesome-icon class="mx-1.5" :icon="['fab', 'youtube']" />
        </a>
    </template>
</template>
