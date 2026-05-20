<template>
    <div>
        <div class="mb-4 flex items-center justify-between">
            <h1 class="flex items-center gap-2 text-2xl font-bold">
                <i-fa6-solid-clock class="text-blue-500" />
                {{ $t("titles.watch_later") }}
            </h1>
            <div class="flex items-center gap-3">
                <span class="text-sm text-gray-500">{{ items.length }} {{ $t("titles.videos") }}</span>
                <button
                    v-if="items.length"
                    class="rounded-md bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
                    @click="clearLater"
                >
                    {{ $t("actions.clear_all") }}
                </button>
            </div>
        </div>

        <div v-if="items.length === 0" class="flex flex-col items-center gap-3 py-20 text-gray-500">
            <i-fa6-solid-clock class="size-12" />
            <p>{{ $t("info.watch_later_empty") }}</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="v in items" :key="v.url" class="relative">
                <router-link :to="{ path: '/watch', query: { v: v.url.substr(-11) } }">
                    <img
                        :src="v.thumbnail"
                        :alt="v.title"
                        class="aspect-video w-full rounded-md object-cover"
                        loading="lazy"
                    />
                    <p class="mt-2 line-clamp-2 text-sm font-medium" v-text="v.title" />
                    <p class="mt-0.5 text-xs text-gray-500" v-text="v.uploaderName" />
                </router-link>
                <button
                    class="absolute top-2 right-2 rounded-full bg-black/70 p-2 text-white hover:bg-red-500"
                    :title="$t('actions.remove')"
                    @click="removeLater(v.url)"
                >
                    <i-fa6-solid-xmark class="size-3" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onActivated } from "vue";
import { useWatchLater } from "@/composables/useWatchLater.js";

const { items, removeLater, clearLater } = useWatchLater();

onActivated(() => {
    document.title = "Watch Later - Piped";
});
</script>
