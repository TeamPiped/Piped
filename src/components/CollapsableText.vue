<template v-if="text">
    <div class="whitespace-pre-wrap py-2 mx-1">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="showFullText" v-html="fullText()" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-else v-html="colapsedText()" />
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
import { purifyHTML, rewriteDescription } from "@/utils/HtmlUtils";

export default {
    props: {
        text: {
            type: String,
            default: null,
        },
    },
    data() {
        return {
            showFullText: false,
        };
    },
    methods: {
        fullText() {
            return purifyHTML(rewriteDescription(this.text));
        },
        colapsedText() {
            return purifyHTML(rewriteDescription(this.text.slice(0, 100)));
        },
    },
};
</script>
