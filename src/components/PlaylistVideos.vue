<template>
    <div ref="scrollable" class="h-screen-sm overflow-x-scroll">
        <VideoItem
            v-for="(related, index) in playlist.relatedStreams"
            :key="related.url"
            :item="related"
            :index="index"
            :playlist-id="playlistId"
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
