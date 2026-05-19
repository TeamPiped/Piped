<template>
    <div>
        <div v-if="loading" class="flex h-40 items-center justify-center">
            <div class="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-500" />
        </div>
        <div v-else-if="videos.length === 0" class="flex flex-col items-center gap-3 py-16 text-gray-500">
            <i-fa6-brands-tiktok class="size-10" />
            <p>{{ $t("tiktok.no_videos") }}</p>
        </div>
        <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            <div
                v-for="video in videos"
                :key="video.id"
                class="group relative cursor-pointer overflow-hidden rounded-xl"
                @click="openVideo(video)"
            >
                <!-- thumbnail -->
                <div class="aspect-9/16 bg-gray-900">
                    <img
                        v-if="video.video.cover"
                        :src="video.video.cover"
                        :alt="video.title"
                        class="size-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                    />
                    <div v-else class="flex h-full items-center justify-center">
                        <i-fa6-brands-tiktok class="size-12 text-gray-600" />
                    </div>
                </div>

                <!-- hover overlay -->
                <div
                    class="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />

                <!-- stats (on hover) -->
                <div
                    class="absolute inset-x-0 bottom-0 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <p class="line-clamp-2 text-xs/tight font-medium" v-text="video.title" />
                    <div class="mt-1 flex items-center gap-2 text-xs text-gray-300">
                        <span class="flex items-center gap-0.5">
                            <i-fa6-solid-play class="size-2.5" />
                            {{ formatCount(video.stats.plays) }}
                        </span>
                        <span class="flex items-center gap-0.5">
                            <i-fa6-solid-heart class="size-2.5" />
                            {{ formatCount(video.stats.likes) }}
                        </span>
                    </div>
                </div>

                <!-- author badge -->
                <div class="absolute top-2 left-2 flex items-center gap-1.5">
                    <img
                        v-if="video.author.avatarUrl"
                        :src="video.author.avatarUrl"
                        class="size-6 rounded-full border border-white/30"
                    />
                    <span class="rounded-sm bg-black/50 px-1 py-0.5 text-xs text-white">
                        @{{ video.author.uniqueId || video.author.nickname }}
                    </span>
                </div>
            </div>
        </div>

        <!-- video lightbox -->
        <Teleport to="body">
            <div
                v-if="activeVideo"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                @click.self="closeVideo"
            >
                <div class="relative mx-4 flex max-h-screen w-full max-w-sm flex-col">
                    <button
                        class="absolute -top-10 right-0 rounded-full p-2 text-white hover:text-gray-300"
                        @click="closeVideo"
                    >
                        <i-fa6-solid-xmark class="size-6" />
                    </button>
                    <div class="relative overflow-hidden rounded-2xl bg-black">
                        <video
                            v-if="activeVideo.video.playUrl"
                            ref="videoEl"
                            :src="activeVideo.video.playUrl"
                            class="max-h-[80vh] w-full object-contain"
                            controls
                            autoplay
                            playsinline
                        />
                        <img v-else :src="activeVideo.video.cover" class="w-full" />
                    </div>
                    <div class="mt-3 flex items-start gap-3 text-white">
                        <img
                            v-if="activeVideo.author.avatarUrl"
                            :src="activeVideo.author.avatarUrl"
                            class="size-10 shrink-0 rounded-full"
                        />
                        <div>
                            <p class="font-semibold">
                                @{{ activeVideo.author.uniqueId || activeVideo.author.nickname }}
                            </p>
                            <p class="mt-1 text-sm text-gray-300" v-text="activeVideo.title" />
                            <div class="mt-2 flex gap-4 text-sm text-gray-400">
                                <span><i-fa6-solid-play class="mr-1" />{{ formatCount(activeVideo.stats.plays) }}</span>
                                <span
                                    ><i-fa6-solid-heart class="mr-1" />{{ formatCount(activeVideo.stats.likes) }}</span
                                >
                                <span
                                    ><i-fa6-solid-comment class="mr-1" />{{
                                        formatCount(activeVideo.stats.comments)
                                    }}</span
                                >
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, nextTick } from "vue";

defineProps({
    videos: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
});

const emit = defineEmits(["watched"]);

const activeVideo = ref(null);
const videoEl = ref(null);

async function openVideo(video) {
    activeVideo.value = video;
    await nextTick();
}

function closeVideo() {
    // Record completion percentage before clearing
    const vid = videoEl.value;
    const watchPct = vid && vid.duration > 0 ? Math.min(1, vid.currentTime / vid.duration) : 0.5;

    if (activeVideo.value) {
        emit("watched", { video: activeVideo.value, watchPct });
    }
    activeVideo.value = null;
}

function formatCount(n) {
    if (!n) return "0";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
}
</script>
