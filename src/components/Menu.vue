<template>
    <MenuDesktop v-if="!isMobile" />
    <MenuMobile v-else />
</template>

<script>
import MenuDesktop from "./MenuDesktop.vue";
import MenuMobile from "./MenuMobile.vue";

export default {
    components: {
        MenuDesktop,
        MenuMobile,
    },
    data() {
        return { isMobile: false };
    },
    mounted() {
        this.updateMenu();
        window.addEventListener("resize", this.updateMenu);
    },
    methods: {
        updateMenu() {
            this.isMobile = window.matchMedia("screen and (max-width: 800px)").matches;
        },
    },
};
</script>
