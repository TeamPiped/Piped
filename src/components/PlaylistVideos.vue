<template>
    <div>
        <router-link :to="{ path: '/playlist', query: { list: playlistId } }"
            ><h1 class="font-bold !text-lg hover:underline" v-text="playlist.name"
        /></router-link>
        <span class="text-sm">
            <template v-if="playlist.uploader">
                <router-link class="link-secondary" :to="playlist.uploaderUrl" :title="playlist.uploader">
                    {{ playlist.uploader }}
                </router-link>
                -
            </template>
            {{ selectedIndex }} / {{ playlist.videos }}
        </span>
    </div>
    <div ref="scrollable" class="mt-4 max-h-screen-sm overflow-y-auto">
        <div
            v-for="(related, index) in playlist.relatedStreams"
            :key="related.url"
            :index="index"
            :playlist-id="playlistId"
            :prefer-listen="preferListen"
        >
            <router-link
                class="flex hover:bg-gray-50 .dark:hover:bg-neutral-800"
                :class="{ 'bg-gray-200 .dark:bg-neutral-700': index === selectedIndex - 1 }"
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
                <span class="min-w-5 flex-none text-xs" v-text="index + 1" />
                <div class="w-24 flex-none pb-1">
                    <VideoThumbnail :item="related" />

                    <div class="relative text-xs">
                        <!-- shorts thumbnail -->
                        <span v-if="related.isShort" v-t="'video.shorts'" class="thumbnail-overlay thumbnail-left" />
                        <span
                            v-if="related.duration > 0 || (related.duration == 0 && related.isShort)"
                            class="thumbnail-overlay thumbnail-right px-0.5"
                            v-text="timeFormat(related.duration)"
                        />
                        <i18n-t
                            v-else
                            keypath="video.live"
                            class="thumbnail-overlay thumbnail-right !bg-red-600"
                            tag="div"
                        >
                            <i class="i-fa6-solid:tower-broadcast w-3" />
                        </i18n-t>
                        <span
                            v-if="related.watched"
                            v-t="'video.watched'"
                            class="thumbnail-overlay bottom-5px left-5px px-0.5"
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
import VideoThumbnail from "./VideoThumbnail.vue";
export default {
    components: { VideoThumbnail },
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
