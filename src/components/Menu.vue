<template>
    <MenuDesktop :collapsed="collapsed" :toggleCollapsed="toggleCollapsed" v-if="!isMobile" />
    <MenuMobile :collapsed="collapsed" :toggleCollapsed="toggleCollapsed" v-else />
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
        toggleCollapse: Function,
    },
    setup() {
        const isMobile = useIsMobile();
        return { isMobile };
    },
};
</script>
