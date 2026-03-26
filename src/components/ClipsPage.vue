<template>
    <ErrorHandler v-if="response && response.error" :message="response.message" :error="response.error" />
</template>

<script setup>
import { ref, onActivated } from "vue";
import { useRouter, useRoute } from "vue-router";
import { fetchJson } from "@/composables/useApi.js";
import { apiUrl } from "@/composables/useApi.js";

const router = useRouter();
const route = useRoute();
const response = ref(null);

onActivated(() => {
    fetchJson(apiUrl() + "/clips/" + route.params.clipId).then(res => {
        response.value = res;
        if (response.value.videoId) {
            router.push(`/watch?v=${response.value.videoId}`);
        }
    });
});
</script>
