<template>
    <div v-t="'actions.loading'" />
</template>

<script>
export default {
    activated() {
        const videoId = this.$route.params.videoId;
        if (videoId)
            this.$router.replace({
                path: "/watch",
                query: { v: videoId, t: this.$route.query.t },
            });
    },
};
</script>
