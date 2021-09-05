<template>
    <p>{{ message }}</p>
    <button uk-toggle="target: #stacktrace" class="uk-button uk-button-small" style="background: #222" type="button">
        {{ $t("actions.show_more") }}
    </button>
    <p id="stacktrace" style="white-space: pre-wrap" hidden>{{ error }}</p>
</template>

<script>
export default {
    props: {
        error: String,
        message: String,
    },
};
</script>
