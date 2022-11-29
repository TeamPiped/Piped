<script>
export default {
    props: {
        id: String, // The id of the content.
        type: String, // The type of the content (video, channel, playlist).

        // The below parameters are only evaluated if `type` is video.
        videoTimestamp: Number,
        videoPlaylistId: String,
        videoPlaylistIndex: Number,
    },

    computed: {
        generatedLink() {
            switch (String(this.type)) {
                case "video": {
                    let url = `https://youtu.be/watch?v=${this.id}`;
                    if (this.videoPlaylistId != undefined) {
                        // If the playlist id is defined then the playlist index is too.
                        url += `&list=${this.videoPlaylistId}&index=${this.videoPlaylistIndex}`;
                    }
                    url += `&t=${parseInt(this.videoTimestamp)}`;
                    return url;
                }
                case "playlist":
                    return `https://youtu.be/playlist?list=${this.id}`;
                case "channel":
                    return `https://youtu.be/channel/${this.id}`;
                default:
                    return `https://youtu.be/${this.id}`;
            }
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
