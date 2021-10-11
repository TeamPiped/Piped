<template>
    <MenuDesktop :collapsed="collapsed" :toggleCollapsed="toggleCollapsedDebounced" v-if="!isMobile" />
    <MenuMobile :collapsed="collapsed" :toggleCollapsed="toggleCollapsedDebounced" v-else />
</template>

<script>
import MenuDesktop from "./MenuDesktop.vue";
import MenuMobile from "./MenuMobile.vue";

import { useIsMobile } from "../store";

export default {
    components: {
        MenuDesktop,
        MenuMobile,
    },
    props: {
        collapsed: Boolean,
        toggleCollapsed: Function,
    },
    data() {
        return { toggleCollapsedDisabled: false };
    },
    setup() {
        const isMobile = useIsMobile();
        return { isMobile };
    },
    methods: {
        toggleCollapsedDebounced() {
            if (!this.toggleCollapsedDisabled) {
                this.toggleCollapsed();
                this.toggleCollapsedDisabled = true;
                setTimeout(() => {
                    this.toggleCollapsedDisabled = false;
                }, 500);
            }
        },
    },
};
</script>
