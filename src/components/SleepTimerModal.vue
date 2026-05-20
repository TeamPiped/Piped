<template>
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="$emit('close')">
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-dark-800">
            <div class="mb-4 flex items-center justify-between">
                <h2 class="flex items-center gap-2 text-lg font-bold">
                    <i-fa6-solid-moon class="text-indigo-500" />
                    {{ $t("titles.sleep_timer") }}
                </h2>
                <button class="text-gray-500 hover:text-gray-900 dark:hover:text-white" @click="$emit('close')">
                    <i-fa6-solid-xmark />
                </button>
            </div>

            <div v-if="active" class="mb-4 rounded-lg bg-indigo-50 p-3 text-center dark:bg-indigo-900/30">
                <p class="text-xs text-indigo-700 dark:text-indigo-300">{{ $t("info.sleep_timer_running") }}</p>
                <p class="mt-1 font-mono text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {{ remainingText }}
                </p>
                <button
                    class="mt-2 rounded-md bg-indigo-500 px-3 py-1 text-sm text-white hover:bg-indigo-600"
                    @click="
                        cancel();
                        $emit('close');
                    "
                >
                    {{ $t("actions.cancel") }}
                </button>
            </div>

            <div v-else class="grid grid-cols-2 gap-2">
                <button
                    v-for="opt in options"
                    :key="opt.minutes"
                    class="rounded-lg bg-gray-100 px-4 py-3 font-medium hover:bg-indigo-500 hover:text-white dark:bg-dark-700"
                    @click="start(opt.minutes)"
                >
                    {{ opt.label }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
import { useSleepTimer } from "@/composables/useSleepTimer.js";

defineEmits(["close"]);

const { setTimer, cancel, remaining, active } = useSleepTimer();

const options = [
    { minutes: 5, label: "5 min" },
    { minutes: 15, label: "15 min" },
    { minutes: 30, label: "30 min" },
    { minutes: 60, label: "1 hour" },
    { minutes: 90, label: "90 min" },
    { minutes: 120, label: "2 hours" },
];

const remainingText = computed(() => {
    const s = remaining.value;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
});

function start(minutes) {
    setTimer(minutes, "pause");
}
</script>
