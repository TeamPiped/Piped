<template>
    <h6 efy_card style="padding: 5rem 10rem 3rem; margin: 0 0 15rem 0">Playlist</h6>
    <div ref="scrollable" class="pp-show-playlist h-screen-sm overflow-y-scroll">
        <VideoItem
            v-for="(related, index) in playlist.relatedStreams"
            :key="related.url"
            :item="related"
            :index="index"
            :playlist-id="playlistId"
            :prefer-listen="preferListen"
            height="94"
            width="168"
        />
    </div>
</template>

<script>
import { nextTick } from "vue";
import VideoItem from "./VideoItem.vue";

export default {
    components: { VideoItem },
    props: {
        playlist: {
            type: Object,
            required: true,
        },
        playlistId: {
            type: String,
            required: true,
        },
        selectedIndex: {
            type: Number,
            required: true,
        },
        preferListen: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        playlist: {
            handler() {
                if (this.selectedIndex - 1 < this.playlist.relatedStreams.length)
                    nextTick(() => {
                        this.updateScroll();
                    });
            },
            deep: true,
        },
    },
    mounted() {
        this.updateScroll();
        this.updateWatched(this.playlist.relatedStreams);
    },
    methods: {
        updateScroll() {
            const elems = Array.from(this.$refs.scrollable.children).filter(elm => elm.matches("div"));
            const index = this.selectedIndex - 1;
            if (index < elems.length)
                this.$refs.scrollable.scrollTop =
                    elems[this.selectedIndex - 1].offsetTop - this.$refs.scrollable.offsetTop;
        },
    },
};
</script>
