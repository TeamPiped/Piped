<template>
    <Teleport to="body">
        <div
            v-if="visible"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            @click.self="close"
        >
            <div class="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-dark-700">
                <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-dark-400">
                    <h2 class="flex items-center gap-2 text-xl font-bold">
                        <i-fa6-solid-keyboard />
                        {{ $t("titles.keyboard_shortcuts") }}
                    </h2>
                    <button class="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-dark-400" @click="close">
                        <i-fa6-solid-xmark />
                    </button>
                </div>
                <div class="max-h-[70vh] overflow-y-auto p-6">
                    <div v-for="section in sections" :key="section.title" class="mb-6 last:mb-0">
                        <h3
                            class="mb-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400"
                        >
                            {{ section.title }}
                        </h3>
                        <div class="space-y-2">
                            <div
                                v-for="item in section.shortcuts"
                                :key="item.key"
                                class="flex items-center justify-between"
                            >
                                <span class="text-sm" v-text="item.description" />
                                <div class="flex gap-1">
                                    <kbd
                                        v-for="k in item.keys"
                                        :key="k"
                                        class="rounded-sm bg-gray-100 px-2 py-0.5 font-mono text-xs font-medium dark:bg-dark-400"
                                        v-text="k"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-t border-gray-200 px-6 py-3 dark:border-dark-400">
                    <p class="text-xs text-gray-500">{{ $t("info.shortcuts_press_hint") }}</p>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const visible = ref(false);

function open() {
    visible.value = true;
}
function close() {
    visible.value = false;
}
function toggle() {
    visible.value = !visible.value;
}

defineExpose({ open, close, toggle });

const sections = [
    {
        title: t("shortcuts.navigation"),
        shortcuts: [
            { keys: ["?"], description: t("shortcuts.show_shortcuts") },
            { keys: ["Ctrl", "K"], description: t("shortcuts.focus_search") },
            { keys: ["G", "H"], description: t("shortcuts.go_home") },
            { keys: ["G", "T"], description: t("shortcuts.go_trending") },
            { keys: ["G", "F"], description: t("shortcuts.go_feed") },
            { keys: ["G", "S"], description: t("shortcuts.go_shorts") },
            { keys: ["G", "Q"], description: t("shortcuts.go_queue") },
        ],
    },
    {
        title: t("shortcuts.player"),
        shortcuts: [
            { keys: ["Space"], description: t("shortcuts.play_pause") },
            { keys: ["K"], description: t("shortcuts.play_pause") },
            { keys: ["←"], description: t("shortcuts.seek_back_5") },
            { keys: ["→"], description: t("shortcuts.seek_forward_5") },
            { keys: ["J"], description: t("shortcuts.seek_back_10") },
            { keys: ["L"], description: t("shortcuts.seek_forward_10") },
            { keys: ["M"], description: t("shortcuts.toggle_mute") },
            { keys: ["F"], description: t("shortcuts.toggle_fullscreen") },
            { keys: ["T"], description: t("shortcuts.toggle_theater") },
            { keys: [","], description: t("shortcuts.speed_down") },
            { keys: ["."], description: t("shortcuts.speed_up") },
        ],
    },
    {
        title: t("shortcuts.shorts"),
        shortcuts: [
            { keys: ["↑"], description: t("shortcuts.prev_short") },
            { keys: ["↓"], description: t("shortcuts.next_short") },
            { keys: ["M"], description: t("shortcuts.toggle_mute") },
        ],
    },
];

function handleKeydown(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        toggle();
    }
    if (e.key === "Escape" && visible.value) close();
}

onMounted(() => window.addEventListener("keydown", handleKeydown));
onUnmounted(() => window.removeEventListener("keydown", handleKeydown));
</script>
