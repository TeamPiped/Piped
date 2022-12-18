<script>
export default {
    props: {
        link: String,
    },
};
</script>

<template>
    <template v-if="this.getPreferenceBoolean('showWatchOnYouTube', false)">
        <a :href="link" class="pp-watch-onyt-btn btn" role="button" :title="$t('player.watch_on') + 'YouTube'">
            <font-awesome-icon class="mx-1.5" :icon="['fab', 'youtube']" />
        </a>
    </template>
</template>

<style>
.pp-watch-onyt-btn {
    display: flex;
    margin-left: var(--efy_gap0);
    align-items: center;
    gap: 5rem;
}
</style>
