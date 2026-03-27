<template>
    <footer class="mt-10 flex w-full flex-wrap items-center justify-center gap-x-6 gap-y-4 rounded-xl py-4 text-center">
        <a
            aria-label="GitHub"
            href="https://github.com/TeamPiped/Piped"
            target="_blank"
            class="inline-flex items-center justify-center"
        >
            <i-fa6-brands-github />
            <span v-t="'actions.source_code'" class="ml-2 hover:underline" />
        </a>
        <a href="https://docs.piped.video/" target="_blank" class="inline-flex items-center justify-center">
            <i-fa6-solid-book />
            <span v-t="'actions.documentation'" class="ml-2 hover:underline" />
        </a>
        <a
            href="https://github.com/TeamPiped/Piped#donations"
            target="_blank"
            class="inline-flex items-center justify-center"
        >
            <i-fa6-brands-bitcoin />
            <span v-t="'actions.donations'" class="ml-2 hover:underline" />
        </a>
        <a v-if="statusPageHref" :href="statusPageHref" class="inline-flex items-center justify-center">
            <i-fa6-solid-server />
            <span v-t="'actions.status_page'" class="ml-2 hover:underline" />
        </a>
        <a v-if="donationHref" :href="donationHref" class="inline-flex items-center justify-center">
            <i-fa6-solid-money-check />
            <span v-t="'actions.instance_donations'" class="ml-2 hover:underline" />
        </a>
        <a
            v-if="privacyPolicyHref"
            :href="privacyPolicyHref"
            target="_blank"
            class="inline-flex items-center justify-center"
        >
            <i-fa6-solid-eye />
            <span v-t="'actions.instance_privacy_policy'" class="ml-2 hover:underline" />
        </a>
    </footer>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { fetchJson, apiUrl } from "@/composables/useApi.js";

const donationHref = ref(null);
const statusPageHref = ref(null);
const privacyPolicyHref = ref(null);

onMounted(() => {
    fetchJson(apiUrl() + "/config").then(config => {
        donationHref.value = config?.donationUrl;
        statusPageHref.value = config?.statusPageUrl;
        privacyPolicyHref.value = config?.privacyPolicyUrl;
    });
});
</script>

<style>
@reference "../app.css";

@layer components {
    footer {
        background-color: var(--color-light-200);
    }
    .dark footer {
        background-color: var(--color-dark-800);
    }
}
</style>
