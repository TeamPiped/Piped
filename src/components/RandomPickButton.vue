<template>
    <button
        class="flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 disabled:opacity-50"
        :disabled="loading"
        :title="$t('actions.random_pick')"
        @click="pick"
    >
        <i-fa6-solid-dice v-if="!loading" />
        <i-fa6-solid-spinner v-else class="animate-spin" />
        <span>{{ $t("actions.random_pick") }}</span>
    </button>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { pickRandomFromFeed, pickRandomFromTrending } from "@/composables/useRandomPick.js";
import { getAuthToken } from "@/composables/useApi.js";

const props = defineProps({
    source: { type: String, default: "feed" }, // "feed" | "trending"
});

const router = useRouter();
const loading = ref(false);

async function pick() {
    loading.value = true;
    try {
        const fn = props.source === "feed" && getAuthToken() ? pickRandomFromFeed : pickRandomFromTrending;
        const video = await fn();
        if (video?.url) {
            const id = video.url.substr(-11);
            router.push({ path: "/watch", query: { v: id } });
        }
    } finally {
        loading.value = false;
    }
}
</script>
