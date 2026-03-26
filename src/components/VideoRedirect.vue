<template>
    <div v-t="'actions.loading'" />
</template>

<script setup>
import { onActivated } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

onActivated(() => {
    const videoId = route.params.videoId;
    if (videoId)
        router.replace({
            path: "/watch",
            query: { v: videoId, t: route.query.t },
        });
});
</script>
