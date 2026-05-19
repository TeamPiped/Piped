<template>
    <div>
        <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold">
            <i-fa6-solid-circle-play class="text-red-500" />
            {{ $t("titles.continue_watching") }}
        </h2>
        <div class="flex gap-3 overflow-x-auto pb-2">
            <div v-for="video in videos" :key="video.url" class="relative w-48 shrink-0 cursor-pointer">
                <router-link :to="watchLink(video)">
                    <div class="relative overflow-hidden rounded-md">
                        <img
                            :src="video.thumbnail"
                            :alt="video.title"
                            class="h-27 w-full object-cover transition-transform hover:scale-105"
                            loading="lazy"
                        />
                        <!-- progress bar -->
                        <div
                            class="absolute bottom-0 left-0 h-1 bg-red-500"
                            :style="{ width: progressPct(video) + '%' }"
                        />
                        <!-- duration badge -->
                        <span
                            v-if="video.duration"
                            class="absolute right-1 bottom-2 rounded-sm bg-black/80 px-1 py-0.5 text-xs text-white"
                            v-text="formatDuration(video.duration)"
                        />
                    </div>
                    <p class="mt-1.5 line-clamp-2 text-sm/tight font-medium" v-text="video.title" />
                    <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400" v-text="video.uploaderName" />
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    videos: {
        type: Array,
        default: () => [],
    },
});

function watchLink(video) {
    const id = video.url?.substr(-11);
    return { path: "/watch", query: { v: id } };
}

function progressPct(video) {
    if (!video.duration || !video.currentTime) return 0;
    return Math.min(100, (video.currentTime / video.duration) * 100);
}

function formatDuration(secs) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}
</script>
