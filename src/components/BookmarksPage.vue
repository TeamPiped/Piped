<template>
    <div>
        <h1 class="mb-6 flex items-center gap-2 text-2xl font-bold">
            <i-fa6-solid-bookmark class="text-yellow-500" />
            {{ $t("titles.bookmarks") }}
        </h1>

        <div v-if="entries.length === 0" class="flex flex-col items-center gap-3 py-20 text-gray-500">
            <i-fa6-solid-bookmark class="size-12" />
            <p>{{ $t("info.bookmarks_empty") }}</p>
        </div>

        <div v-else class="space-y-4">
            <div v-for="e in entries" :key="e.id" class="rounded-lg bg-gray-100 p-4 dark:bg-dark-800">
                <div class="mb-3 flex items-center justify-between">
                    <router-link :to="{ path: '/watch', query: { v: e.id } }" class="font-medium hover:text-red-500">
                        {{ e.id }}
                    </router-link>
                    <span class="text-xs text-gray-500">{{ e.marks.length }} {{ $t("titles.bookmarks") }}</span>
                </div>
                <div class="space-y-1.5">
                    <div
                        v-for="m in e.marks"
                        :key="m.time"
                        class="flex items-center gap-3 rounded-md bg-white px-3 py-2 dark:bg-dark-700"
                    >
                        <router-link
                            :to="{ path: '/watch', query: { v: e.id, t: m.time } }"
                            class="font-mono text-sm text-yellow-600 hover:underline dark:text-yellow-400"
                        >
                            {{ formatTime(m.time) }}
                        </router-link>
                        <span class="flex-1 truncate text-sm" v-text="m.note || $t('titles.bookmark')" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from "vue";
import { getAllBookmarkedVideos } from "@/composables/useBookmarks.js";

const entries = ref([]);

function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
}

function refresh() {
    entries.value = getAllBookmarkedVideos();
}

onMounted(refresh);
onActivated(() => {
    document.title = "Bookmarks - Piped";
    refresh();
});
</script>
