<template>
    <div class="relative">
        <h1 class="sr-only">{{ $t("titles.shorts") }}</h1>

        <div v-if="!current" class="flex h-[80vh] items-center justify-center">
            <LoadingIndicatorPage :show-content="false" />
        </div>

        <div v-else class="mx-auto max-w-sm">
            <!-- Shorts player card -->
            <div
                ref="playerCard"
                class="relative overflow-hidden rounded-xl bg-black"
                :style="{ height: playerHeight + 'px' }"
            >
                <video
                    ref="videoEl"
                    class="size-full object-cover"
                    :src="currentStreamUrl"
                    :autoplay="autoplay"
                    loop
                    playsinline
                    @click="togglePlay"
                    @loadedmetadata="onLoaded"
                    @ended="onEnded"
                />

                <!-- overlay -->
                <div
                    class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent"
                />

                <!-- mute button -->
                <button
                    class="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white"
                    @click.stop="muted = !muted"
                >
                    <i-fa6-solid-volume-xmark v-if="muted" />
                    <i-fa6-solid-volume-high v-else />
                </button>

                <!-- info overlay -->
                <div class="absolute inset-x-0 bottom-0 p-4 text-white">
                    <router-link :to="current.uploaderUrl ?? ''" class="mb-1 flex items-center gap-2">
                        <img
                            v-if="current.uploaderAvatar"
                            :src="current.uploaderAvatar"
                            class="size-8 rounded-full border border-white/40"
                        />
                        <span class="font-semibold drop-shadow-sm">{{ current.uploaderName }}</span>
                    </router-link>
                    <p class="line-clamp-2 text-sm drop-shadow-sm" v-text="current.title" />
                    <div class="mt-2 flex items-center gap-3 text-sm">
                        <span class="flex items-center gap-1">
                            <i-fa6-solid-eye />
                            {{ numberFormat(current.views) }}
                        </span>
                    </div>
                </div>

                <!-- pause indicator -->
                <Transition name="fade">
                    <div v-if="showPauseIcon" class="absolute inset-0 flex items-center justify-center">
                        <div class="rounded-full bg-black/40 p-5">
                            <i-fa6-solid-pause class="size-10 text-white" />
                        </div>
                    </div>
                </Transition>
            </div>

            <!-- navigation buttons -->
            <div class="mt-3 flex justify-center gap-6">
                <button
                    :disabled="index === 0"
                    class="flex items-center gap-1 rounded-full bg-gray-200 px-5 py-2 font-medium disabled:opacity-40 dark:bg-dark-400"
                    @click="prev"
                >
                    <i-fa6-solid-chevron-up />
                </button>
                <router-link
                    :to="watchRoute"
                    class="rounded-full bg-red-500 px-5 py-2 font-medium text-white hover:bg-red-600"
                >
                    {{ $t("actions.watch_full") }}
                </router-link>
                <button
                    class="flex items-center gap-1 rounded-full bg-gray-200 px-5 py-2 font-medium dark:bg-dark-400"
                    @click="next"
                >
                    <i-fa6-solid-chevron-down />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onActivated, onDeactivated } from "vue";
import { useI18n } from "vue-i18n";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import { fetchJson, apiUrl } from "@/composables/useApi.js";
import { getPreferenceString } from "@/composables/usePreferences.js";
import { numberFormat } from "@/composables/useFormatting.js";

const { t } = useI18n();

const videos = ref([]);
const index = ref(0);
const currentStreamUrl = ref(null);
const muted = ref(true);
const autoplay = ref(true);
const showPauseIcon = ref(false);
const playerHeight = ref(600);
const videoEl = ref(null);

const current = computed(() => videos.value[index.value] ?? null);
const watchRoute = computed(() => {
    if (!current.value) return "/";
    const id = current.value.url?.substr(-11);
    return { path: "/watch", query: { v: id } };
});

function updatePlayerHeight() {
    playerHeight.value = Math.min(window.innerHeight - 160, 700);
}

async function fetchStreamUrl(video) {
    if (!video?.url) return;
    const id = video.url.substr(-11);
    try {
        const data = await fetchJson(apiUrl() + "/streams/" + id);
        const streams = data?.videoStreams ?? [];
        const dash = data?.dash;
        if (dash) {
            currentStreamUrl.value = dash;
            return;
        }
        const best = streams
            .filter(s => (s.mimeType?.includes("video") && s.quality?.includes("360")) || s.quality?.includes("480"))
            .sort((a, b) => (b.bitrate ?? 0) - (a.bitrate ?? 0))[0];
        currentStreamUrl.value = best?.url ?? streams[0]?.url ?? null;
    } catch {
        currentStreamUrl.value = null;
    }
}

watch(current, async v => {
    currentStreamUrl.value = null;
    if (v) await fetchStreamUrl(v);
});

watch(muted, v => {
    if (videoEl.value) videoEl.value.muted = v;
});

function onLoaded() {
    if (videoEl.value) {
        videoEl.value.muted = muted.value;
        videoEl.value.play().catch(() => {});
    }
}

function onEnded() {
    next();
}

function togglePlay() {
    if (!videoEl.value) return;
    if (videoEl.value.paused) {
        videoEl.value.play();
        showPauseIcon.value = false;
    } else {
        videoEl.value.pause();
        showPauseIcon.value = true;
        setTimeout(() => (showPauseIcon.value = false), 1200);
    }
}

function next() {
    if (index.value < videos.value.length - 1) {
        index.value++;
        if (index.value >= videos.value.length - 3) loadMore();
    }
}

function prev() {
    if (index.value > 0) index.value--;
}

let nextpage = null;
let loadingMore = false;

async function loadMore() {
    if (loadingMore) return;
    loadingMore = true;
    try {
        const region = getPreferenceString("region", "US");
        const data = nextpage
            ? await fetchJson(apiUrl() + "/nextpage/trending", { region, nextpage })
            : await fetchJson(apiUrl() + "/trending", { region });
        const shorts = (data?.relatedStreams ?? data ?? []).filter(
            v => v.isShort || (v.duration > 0 && v.duration <= 60),
        );
        nextpage = data?.nextpage ?? null;
        videos.value = [...videos.value, ...shorts];
    } finally {
        loadingMore = false;
    }
}

function handleKeydown(e) {
    if (e.key === "ArrowDown" || e.key === "j") next();
    else if (e.key === "ArrowUp" || e.key === "k") prev();
    else if (e.key === "m") muted.value = !muted.value;
}

onMounted(async () => {
    updatePlayerHeight();
    window.addEventListener("resize", updatePlayerHeight);
    await loadMore();
    if (current.value) await fetchStreamUrl(current.value);
});

onActivated(() => {
    document.title = t("titles.shorts") + " - Piped";
    window.addEventListener("keydown", handleKeydown);
});

onDeactivated(() => {
    window.removeEventListener("keydown", handleKeydown);
    window.removeEventListener("resize", updatePlayerHeight);
    if (videoEl.value) videoEl.value.pause();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
