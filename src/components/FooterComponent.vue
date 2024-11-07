<template>
    <footer class="mt-10 w-full rounded-xl py-4 text-center children:(mx-3)">
        <a aria-label="GitHub" href="https://github.com/TeamPiped/Piped" target="_blank">
            <i class="i-fa6-brands:github" />
            <span v-t="'actions.source_code'" class="ml-2" />
        </a>
        <a href="https://docs.piped.video/" target="_blank">
            <i class="i-fa6-solid:book" />
            <span v-t="'actions.documentation'" class="ml-2" />
        </a>
        <a href="https://github.com/TeamPiped/Piped#donations" target="_blank">
            <i class="i-fa6-brands:bitcoin" />
            <span v-t="'actions.donations'" class="ml-2" />
        </a>
        <a v-if="statusPageHref" :href="statusPageHref">
            <i class="i-fa6-solid:server" />
            <span v-t="'actions.status_page'" class="ml-2" />
        </a>
        <a v-if="donationHref" :href="donationHref">
            <i class="i-fa6-solid:money-check" />
            <span v-t="'actions.instance_donations'" class="ml-2" />
        </a>
        <a v-if="privacyPolicyHref" :href="privacyPolicyHref" target="_blank">
            <i class="i-fa6-solid:eye" />
            <span v-t="'actions.instance_privacy_policy'" class="ml-2" />
        </a>
    </footer>
</template>

<script>
export default {
    data() {
        return {
            donationHref: null,
            statusPageHref: null,
            privacyPolicyHref: null,
        };
    },
    mounted() {
        this.fetchConfig();
    },
    methods: {
        async fetchConfig() {
            this.fetchJson(this.apiUrl() + "/config").then(config => {
                this.donationHref = config?.donationUrl;
                this.statusPageHref = config?.statusPageUrl;
                this.privacyPolicyHref = config?.privacyPolicyUrl;
            });
        },
    },
};
</script>

<style>
footer {
    @apply bg-light-900;
}
.dark footer {
    @apply bg-dark-800;
}
</style>
