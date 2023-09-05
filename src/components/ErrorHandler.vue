<template>
    <p v-text="message" />
    <button v-t="'actions.show_more'" class="btn" @click="toggleTrace" />
    <p ref="stacktrace" class="whitespace-pre-wrap" hidden v-text="error" />
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
