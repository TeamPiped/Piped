import { ref } from "vue";

const isMobile = ref(false);
export function useIsMobile() {
    isMobile.value = window.matchMedia("screen and (max-width: 800px)").matches;
    window.addEventListener("resize", () => {
        isMobile.value = window.matchMedia("screen and (max-width: 800px)").matches;
    });

    return isMobile;
}

const menuCollapsed = ref(false);
export function useMenuCollapsed() {
    return {
        menuCollapsed,
        toggleCollapsed: () => {
            menuCollapsed.value = !menuCollapsed.value;
        },
    };
}
