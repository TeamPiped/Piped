<script setup>
import { useRegisterSW } from "virtual:pwa-register/vue";

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW();

const close = async () => {
    offlineReady.value = false;
    needRefresh.value = false;
};
</script>

<template>
    <div v-if="offlineReady || needRefresh" class="pwa-toast" role="alert">
        <div class="message">
            <span v-if="offlineReady"> App ready to work offline </span>
            <span v-else> New content available, click on reload button to update. </span>
        </div>
        <button v-if="needRefresh" @click="updateServiceWorker()">Reload</button>
        <button @click="close">Close</button>
    </div>
</template>

<style>
.pwa-toast {
    @apply fixed right-0 bottom-0 m-4 p-3 border border-gray-500 rounded shadow bg-white text-gray-700;
}
.pwa-toast .message {
    @apply margin-bottom-2;
}
.pwa-toast button {
    @apply border border-solid border-gray-500 rounded px-2 py-1;
}
</style>
