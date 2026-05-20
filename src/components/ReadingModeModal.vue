<template>
    <div class="fixed inset-0 z-50 overflow-y-auto bg-white dark:bg-dark-900" @click.self="$emit('close')">
        <div class="mx-auto max-w-3xl px-6 py-8">
            <div class="mb-6 flex items-start justify-between gap-4">
                <h1 class="font-serif text-2xl/tight font-bold" v-text="title" />
                <button
                    class="shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700"
                    @click="$emit('close')"
                >
                    <i-fa6-solid-xmark class="size-5" />
                </button>
            </div>

            <div class="mb-6 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <span v-if="uploader" v-text="uploader" />
                <span v-if="uploader">·</span>
                <button
                    class="rounded-sm px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-dark-700"
                    @click="fontSize = Math.max(14, fontSize - 2)"
                >
                    A-
                </button>
                <button
                    class="rounded-sm px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-dark-700"
                    @click="fontSize = Math.min(24, fontSize + 2)"
                >
                    A+
                </button>
            </div>

            <article
                ref="article"
                class="font-serif leading-relaxed"
                :style="{ fontSize: fontSize + 'px' }"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import DOMPurify from "dompurify";

const props = defineProps({
    title: { type: String, default: "" },
    uploader: { type: String, default: "" },
    description: { type: String, default: "" },
});
defineEmits(["close"]);

const fontSize = ref(18);
const article = ref(null);

function render() {
    if (!article.value) return;
    if (!props.description) {
        article.value.innerHTML = "";
        return;
    }
    const escaped = props.description
        .split(/\n\n+/)
        .map(p => `<p style="margin-bottom:1em">${p.replace(/\n/g, "<br>")}</p>`)
        .join("");
    article.value.innerHTML = DOMPurify.sanitize(escaped);
    // Style links to use accent colour
    article.value.querySelectorAll("a").forEach(a => {
        a.style.color = "var(--piped-accent, #fa4b4b)";
        a.style.textDecoration = "underline";
    });
}

onMounted(render);
watch(() => props.description, render);
</script>
