<template>
    <div>
        <div class="mb-4 flex items-center justify-between">
            <h1 class="flex items-center gap-2 text-2xl font-bold">
                <i-fa6-solid-list-ul class="text-red-500" />
                {{ $t("titles.queue") }}
            </h1>
            <div class="flex gap-2">
                <router-link
                    v-if="queue.length > 0"
                    :to="{ path: '/watch', query: { v: queue[0].url?.substr(-11) } }"
                    class="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
                >
                    <i-fa6-solid-play />
                    {{ $t("actions.play_all") }}
                </router-link>
                <button
                    v-if="queue.length > 0"
                    class="flex items-center gap-1.5 rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 hover:bg-gray-300 dark:bg-dark-400 dark:text-gray-300 dark:hover:bg-dark-300"
                    @click="clearQueue"
                >
                    <i-fa6-solid-trash />
                    {{ $t("actions.clear") }}
                </button>
            </div>
        </div>

        <div v-if="queue.length === 0" class="flex flex-col items-center gap-3 py-20 text-gray-500">
            <i-fa6-solid-list-ul class="size-12" />
            <p class="text-lg">{{ $t("info.queue_empty") }}</p>
            <p class="text-sm">{{ $t("info.queue_hint") }}</p>
        </div>

        <div v-else class="flex flex-col gap-3">
            <div
                v-for="(video, i) in queue"
                :key="video.url"
                class="flex items-center gap-3 rounded-xl bg-gray-100 p-3 dark:bg-dark-800"
            >
                <span class="w-6 shrink-0 text-center text-sm font-bold text-gray-400">{{ i + 1 }}</span>
                <router-link :to="{ path: '/watch', query: { v: video.url?.substr(-11) } }" class="shrink-0">
                    <img
                        :src="video.thumbnail"
                        :alt="video.title"
                        class="h-16 w-28 rounded-md object-cover"
                        loading="lazy"
                    />
                </router-link>
                <div class="min-w-0 flex-1">
                    <router-link :to="{ path: '/watch', query: { v: video.url?.substr(-11) } }">
                        <p class="line-clamp-2 leading-tight font-medium hover:text-red-500" v-text="video.title" />
                    </router-link>
                    <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400" v-text="video.uploaderName" />
                </div>
                <div class="flex shrink-0 gap-2">
                    <button
                        :disabled="i === 0"
                        class="rounded-md p-2 hover:bg-gray-200 disabled:opacity-30 dark:hover:bg-dark-400"
                        :title="$t('actions.move_up')"
                        @click="moveUp(video.url)"
                    >
                        <i-fa6-solid-chevron-up />
                    </button>
                    <button
                        class="rounded-md p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        :title="$t('actions.remove_from_playlist')"
                        @click="removeFromQueue(video.url)"
                    >
                        <i-fa6-solid-xmark />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onActivated } from "vue";
import { useI18n } from "vue-i18n";
import { useQueue } from "@/composables/useQueue.js";

const { t } = useI18n();
const { queue, removeFromQueue, clearQueue, moveUp } = useQueue();

onActivated(() => {
    document.title = t("titles.queue") + " - Piped";
});
</script>
