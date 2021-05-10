<template>
    <div class="uk-container uk-container-expand uk-light uk-height-viewport" style="background: #0b0e0f">
        <Navigation />
        <router-view />

        <div style="text-align: center">
            <a aria-label="GitHub" href="https://github.com/TeamPiped/Piped">
                <font-awesome-icon :icon="['fab', 'github']"></font-awesome-icon>
            </a>
            &nbsp;
            <a href="bitcoin://13MoHioctZkC7LDSZSb4m32TDT8xNmei1p">
                <font-awesome-icon :icon="['fab', 'bitcoin']"></font-awesome-icon>
                13MoHioctZkC7LDSZSb4m32TDT8xNmei1p
            </a>
        </div>
    </div>
</template>

<script>
import Navigation from "@/components/Navigation";
export default {
    components: {
        Navigation,
    },
};
</script>

<style>
#app {
    background: #0b0e0f;
}

::-webkit-scrollbar {
    background-color: #15191a;
    color: #c5bcae;
}

::-webkit-scrollbar-thumb {
    background-color: #4b4f52;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #5b6469;
}

::-webkit-scrollbar-thumb:active {
    background-color: #485053;
}

::-webkit-scrollbar-corner {
    background-color: #0b0e0f;
}

* {
    scrollbar-color: #15191a #444a4e;
}
</style>
