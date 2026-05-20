<template>
    <div class="rounded-lg border border-gray-200 p-3 dark:border-dark-700">
        <div class="mb-2 flex items-center justify-between">
            <h3 class="flex items-center gap-1.5 text-sm font-semibold">
                <i-fa6-solid-bookmark class="text-yellow-500" />
                {{ $t("titles.bookmarks") }}
            </h3>
            <button
                class="rounded-md bg-yellow-500 px-2 py-1 text-xs font-medium text-white hover:bg-yellow-600"
                @click="adding = !adding"
            >
                <i-fa6-solid-plus class="mr-1 inline" />
                {{ $t("actions.add_bookmark") }}
            </button>
        </div>

        <div v-if="adding" class="mb-2 flex gap-2">
            <input
                v-model="note"
                type="text"
                :placeholder="$t('actions.bookmark_note')"
                class="flex-1 rounded-md bg-gray-100 px-2 py-1 text-sm dark:bg-dark-700"
                @keyup.enter="save"
            />
            <button class="rounded-md bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600" @click="save">
                {{ $t("actions.save") }}
            </button>
        </div>

        <div v-if="bookmarks.length === 0" class="py-2 text-center text-xs text-gray-500">
            {{ $t("info.bookmarks_empty_video") }}
        </div>
        <div v-else class="space-y-1">
            <div
                v-for="b in bookmarks"
                :key="b.time"
                class="group flex items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-dark-700"
            >
                <button
                    class="font-mono text-xs text-yellow-600 hover:underline dark:text-yellow-400"
                    @click="$emit('seek', b.time)"
                >
                    {{ formatTime(b.time) }}
                </button>
                <span class="flex-1 truncate text-sm" v-text="b.note || $t('titles.bookmark')" />
                <button class="opacity-0 group-hover:opacity-100 hover:text-red-500" @click="remove(b.time)">
                    <i-fa6-solid-xmark class="size-3" />
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useBookmarks } from "@/composables/useBookmarks.js";

const props = defineProps({
    videoId: { type: String, required: true },
    currentTime: { type: Number, default: 0 },
});
defineEmits(["seek"]);

const adding = ref(false);
const note = ref("");

const { store, list, add, remove } = useBookmarks(props.videoId);

const bookmarks = computed(() => {
    // re-read on store change
    void store.value;
    return list();
});

function save() {
    add(props.currentTime, note.value.trim());
    note.value = "";
    adding.value = false;
}

function formatTime(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
}
</script>
