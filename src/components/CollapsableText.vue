<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="text" class="whitespace-pre-wrap py-2 mx-1">
        <span v-if="showFullText" v-html="purifyHTML(rewriteDescription(text))" />
        <span v-else v-html="purifyHTML(rewriteDescription(text.slice(0, 100)))" />
        <span v-if="text.length > 100 && !showFullText">...</span>
        <button
            v-if="text.length > 100"
            class="hover:underline font-semibold text-neutral-500 block whitespace-normal"
            @click="showFullText = !showFullText"
        >
            [{{ showFullText ? $t("actions.show_less") : $t("actions.show_more") }}]
        </button>
    </div>
</template>

<script>
export default {
    props: {
        text: String,
    },
    data() {
        return {
            showFullText: false,
        };
    },
};
</script>
