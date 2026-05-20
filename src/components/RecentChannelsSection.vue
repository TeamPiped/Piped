<template>
    <div v-if="channels.length">
        <h2 class="mb-3 flex items-center gap-2 text-lg font-semibold">
            <i-fa6-solid-users class="text-purple-500" />
            {{ $t("titles.recent_channels") }}
        </h2>
        <div class="mb-6 flex gap-4 overflow-x-auto pb-2">
            <router-link
                v-for="c in channels"
                :key="c.url"
                :to="c.url"
                class="flex w-20 shrink-0 flex-col items-center text-center hover:text-red-500"
            >
                <img
                    v-if="c.avatar"
                    :src="c.avatar"
                    :alt="c.name"
                    class="size-16 rounded-full object-cover"
                    loading="lazy"
                />
                <div
                    v-else
                    class="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-purple-400 to-pink-400 text-2xl font-bold text-white"
                >
                    {{ c.name?.charAt(0) ?? "?" }}
                </div>
                <p class="mt-2 line-clamp-2 text-xs/tight" v-text="c.name" />
            </router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getRecentChannels } from "@/composables/useChannelTime.js";

const channels = ref([]);

onMounted(async () => {
    channels.value = await getRecentChannels(10);
});
</script>
