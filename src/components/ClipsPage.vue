<template>
    <ErrorHandler v-if="response && response.error" :message="response.message" :error="response.error" />
</template>

<script>
export default {
    activated() {
        this.fetchJson(this.apiUrl() + "/clips/" + this.$route.params.clipId).then(response => {
            this.response = response;
            if (this.response.videoId) {
                this.$router.push(`/watch?v=${this.response.videoId}`);
            }
        });
    },
};
</script>
