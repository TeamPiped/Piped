<template>
    <p v-text="message" />
    >
    <button @click="toggleTrace" class="btn" v-text="$t('actions.show_more')" />
    <p ref="stacktrace" style="white-space: pre-wrap" hidden v-text="error" />
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
