<script>
export default {
    props: {
        videoId: String,
        currentTime: Number,
        playlistId: String,
        playlistIndex: String,
    },

    computed: {
        generatedLink() {
            let url = `https://youtu.be/watch?v=${this.videoId}`;
            if (this.playlistId != undefined) {
                // If this.playlistId is defined then this.playlistIndex is too.
                url += `&list=${this.playlistId}&index=${this.playlistIndex}`;
            }
            url += `&t=${parseInt(this.currentTime)}`;
            return url;
        },
    },
};
</script>

<template>
    <template v-if="this.getPreferenceBoolean('showWatchOnYouTube', false)">
        <!-- For large screens -->
        <a :href="generatedLink" class="btn lt-lg:hidden">
            <i18n-t keypath="player.watch_on" tag="strong">
                <font-awesome-icon class="mx-1.5" :icon="['fab', 'youtube']" />
            </i18n-t>
        </a>
        <!-- For small screens -->
        <a :href="generatedLink" class="btn lg:hidden">
            <font-awesome-icon class="mx-1.5" :icon="['fab', 'youtube']" />
        </a>
    </template>
</template>
