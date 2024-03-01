<template v-if="text">
    <div class="whitespace-pre-wrap">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-if="showFullText" v-html="fullText()" />
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-else v-html="colapsedText()" />
        <span v-if="text.length > visibleLimit && !showFullText">...</span>
        <button
            v-if="text.length > visibleLimit"
            style="
                margin: 0 0 0 10rem;
                background: var(--efy_bg1);
                -webkit-text-fill-color: var(--efy_text);
                padding: 5rem 8rem;
            "
            class="efy_shadow_trans efy_shadow_button_off efy_button_text_off"
            @click="showFullText = !showFullText"
        >
            {{ showFullText ? $t("actions.show_less") : $t("actions.show_more") }}
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
        visibleLimit: {
            type: Number,
            default: 100,
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
            return purifyHTML(rewriteDescription(this.text.slice(0, this.visibleLimit)));
        },
    },
};
</script>
