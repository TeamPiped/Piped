<template>
    <p v-text="message" />
    <button @click="toggleTrace" class="btn" v-t="'actions.show_more'" />
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
