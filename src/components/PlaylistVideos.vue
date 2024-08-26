<template>
    <div ref="scrollable" class="mt-4 h-screen-sm overflow-y-scroll">
        <div
            v-for="(related, index) in playlist.relatedStreams"
            :key="related.url"
            :index="index"
            :playlist-id="playlistId"
            :prefer-listen="preferListen"
        >
            <router-link
                class="flex hover:bg-gray-100"
                :class="{ 'bg-gray-200': index === selectedIndex - 1 }"
                :to="{
                    path: '/watch',
                    query: {
                        v: related.url.substr(-11),
                        ...(playlistId && { list: playlistId }),
                        ...(index >= 0 && { index: index + 1 }),
                        ...(preferListen && { listen: 1 }),
                    },
                }"
            >
                <span class="min-w-4 flex-none text-xs" v-text="index + 1" />
                <div class="w-24 flex-none">
                    <img
                        loading="lazy"
                        class="aspect-video w-full object-contain"
                        :src="related.thumbnail"
                        :alt="related.title"
                        :class="{ 'shorts-img': related.isShort, 'opacity-75': related.watched }"
                    />
                    <!-- progress bar -->
                    <div class="relative h-1 w-full">
                        <div
                            v-if="related.watched && related.duration > 0"
                            class="absolute bottom-0 left-0 h-1 bg-red-600"
                            :style="{ width: `clamp(0%, ${(related.currentTime / related.duration) * 100}%, 100%` }"
                        />
                    </div>
                </div>
                <div class="ml-2 flex flex-col">
                    <span class="text-sm font-semibold leading-4" :title="related.title" v-text="related.title" />
                    <div class="flex-1">
                        <router-link
                            v-if="related.uploaderUrl && related.uploaderName && !hideChannel"
                            class="link-secondary block overflow-hidden text-xs"
                            :to="related.uploaderUrl"
                            :title="related.uploaderName"
                        >
                            <span v-text="related.uploaderName" />
                            <i v-if="related.uploaderVerified" class="i-fa6-solid:check ml-1.5" />
                        </router-link>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script>
import { nextTick } from "vue";
import VideoItem from "./VideoItem.vue";

export default {
    components: {},
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
