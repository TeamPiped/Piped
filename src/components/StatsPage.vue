<template>
    <div>
        <h1 class="mb-6 flex items-center gap-2 text-2xl font-bold">
            <i-fa6-solid-chart-line class="text-green-500" />
            {{ $t("titles.stats") }}
        </h1>

        <!-- summary cards -->
        <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-xl bg-gray-100 p-4 dark:bg-dark-800">
                <p class="text-xs text-gray-500 uppercase">{{ $t("stats.hours_watched") }}</p>
                <p class="mt-1 text-2xl font-bold">{{ hoursWatched }}</p>
            </div>
            <div class="rounded-xl bg-gray-100 p-4 dark:bg-dark-800">
                <p class="text-xs text-gray-500 uppercase">{{ $t("stats.videos_watched") }}</p>
                <p class="mt-1 text-2xl font-bold">{{ stats.totalVideos }}</p>
            </div>
            <div class="rounded-xl bg-gray-100 p-4 dark:bg-dark-800">
                <p class="text-xs text-gray-500 uppercase">{{ $t("stats.channels") }}</p>
                <p class="mt-1 text-2xl font-bold">{{ stats.channels.length }}</p>
            </div>
            <div class="rounded-xl bg-gray-100 p-4 dark:bg-dark-800">
                <p class="text-xs text-gray-500 uppercase">{{ $t("stats.avg_per_video") }}</p>
                <p class="mt-1 text-2xl font-bold">{{ avgMinutes }}m</p>
            </div>
        </div>

        <!-- top channels -->
        <h2 class="mb-3 text-lg font-semibold">{{ $t("stats.top_channels") }}</h2>
        <div
            v-if="stats.channels.length === 0"
            class="rounded-lg bg-gray-100 p-6 text-center text-gray-500 dark:bg-dark-800"
        >
            {{ $t("info.stats_empty") }}
        </div>
        <div v-else class="space-y-2">
            <div
                v-for="(c, i) in stats.channels.slice(0, 20)"
                :key="c.url"
                class="flex items-center gap-3 rounded-lg bg-gray-100 p-3 dark:bg-dark-800"
            >
                <span class="w-6 text-right font-mono text-sm text-gray-500">{{ i + 1 }}.</span>
                <router-link :to="c.url" class="flex-1 truncate font-medium hover:text-red-500">
                    {{ c.name }}
                </router-link>
                <div class="text-right">
                    <p class="text-sm font-semibold">{{ formatTime(c.seconds) }}</p>
                    <p class="text-xs text-gray-500">{{ c.videos }} {{ $t("titles.videos") }}</p>
                </div>
                <!-- proportional bar -->
                <div class="hidden h-2 w-32 overflow-hidden rounded-full bg-gray-200 sm:block dark:bg-dark-700">
                    <div class="h-full bg-green-500" :style="{ width: barWidth(c.seconds) + '%' }" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getChannelStats } from "@/composables/useChannelTime.js";

const stats = ref({ totalSeconds: 0, channels: [], totalVideos: 0 });

const hoursWatched = computed(() => (stats.value.totalSeconds / 3600).toFixed(1));
const avgMinutes = computed(() =>
    stats.value.totalVideos > 0 ? Math.round(stats.value.totalSeconds / stats.value.totalVideos / 60) : 0,
);
const maxSeconds = computed(() => stats.value.channels[0]?.seconds ?? 1);

function barWidth(s) {
    return Math.max(2, (s / maxSeconds.value) * 100);
}

function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

onMounted(async () => {
    document.title = "Statistics - Piped";
    stats.value = await getChannelStats();
});
</script>
