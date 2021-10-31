<template>
    <p>{{ message }}</p>
    <button @click="toggleTrace" class="uk-button uk-button-small" type="button">
        {{ $t("actions.show_more") }}
    </button>
    <p ref="stacktrace" style="white-space: pre-wrap" hidden>{{ error }}</p>
</template>

<script>
export default {
    props: {
        error: { type: String, default: null },
        message: { type: String, default: null },
    },
    methods: {
        toggleTrace() {
            this.$refs.stacktrace.hidden = !this.$refs.stacktrace.hidden;
        },
    },
};
</script>
