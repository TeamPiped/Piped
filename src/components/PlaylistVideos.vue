<template>
    <div>
        <router-link :to="{ path: '/playlist', query: { list: playlistId } }"
            ><h1 class="text-lg! font-bold hover:underline" v-text="playlist.name"
        /></router-link>
        <span class="text-sm">
            <template v-if="playlist.uploader">
                <router-link
                    class="underline decoration-dark-400 hover:text-dark-400 focus:text-dark-400 dark:text-gray-300 dark:decoration-dark-100 dark:hover:text-gray-400"
                    :to="playlist.uploaderUrl"
                    :title="playlist.uploader"
                >
                    {{ playlist.uploader }}
                </router-link>
                -
            </template>
            {{ selectedIndex }} / {{ playlist.videos }}
        </span>
    </div>
    <div ref="scrollable" class="mt-4 max-h-160 overflow-y-auto">
        <div
            v-for="(related, index) in playlist.relatedStreams"
            :key="related.url"
            :index="index"
            :playlist-id="playlistId"
            :prefer-listen="preferListen"
        >
            <router-link
                class="flex rounded-sm px-2 py-1 hover:bg-gray-50 dark:hover:bg-neutral-800"
                :class="{ 'bg-gray-200 dark:bg-neutral-700': index === selectedIndex - 1 }"
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
                <div class="w-24 flex-none">
                    <VideoThumbnail :item="related" :small="true" />
                </div>

                <div class="ml-2 flex flex-col">
                    <span
                        class="hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
                        :title="related.title"
                        v-text="related.title"
                    />
                    <div class="flex-1">
                        <router-link
                            v-if="related.uploaderUrl && related.uploaderName && !hideChannel"
                            class="block overflow-hidden text-xs underline decoration-dark-400 hover:text-dark-400 focus:text-dark-400 dark:text-gray-300 dark:decoration-dark-100 dark:hover:text-gray-400"
                            :to="related.uploaderUrl"
                            :title="related.uploaderName"
                        >
                            <span v-text="related.uploaderName" />
                            <i-fa6-solid-check v-if="related.uploaderVerified" class="ml-1.5" />
                        </router-link>
                    </div>
                </div>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import VideoThumbnail from "./VideoThumbnail.vue";
import { updateWatched } from "@/composables/useMisc.js";

const props = defineProps({
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
});

const scrollable = ref(null);

watch(
    () => props.playlist,
    () => {
        if (props.selectedIndex - 1 < props.playlist.relatedStreams.length)
            nextTick(() => {
                updateScroll();
            });
    },
    { deep: true },
);

function updateScroll() {
    const elems = Array.from(scrollable.value.children).filter(elm => elm.matches("div"));
    const index = props.selectedIndex - 1;
    if (index < elems.length)
        scrollable.value.scrollTop = elems[props.selectedIndex - 1].offsetTop - scrollable.value.offsetTop;
}

onMounted(() => {
    updateScroll();
    updateWatched(props.playlist.relatedStreams);
});
</script>
