<template>
    <notifications />
    <div class="uk-flex">
        <Menu style="flexShrink: 0" />
        <main
            class="uk-container uk-container-expand"
            style="overflow-y: scroll; overflow-x: hidden; flex: 1;"
            :style="{
                background: backgroundColor,
                colour: foregroundColor,
                marginTop: isMobile ? '70px' : 0,
                height: isMobile ? 'calc(100vh - 70px)' : '100vh',
            }"
            :class="{ 'uk-light': darkMode }"
        >
            <router-view v-slot="{ Component }">
                <keep-alive :max="5">
                    <component :is="Component" :key="$route.fullPath" />
                </keep-alive>
            </router-view>

            <div
                style="text-align: center; position: fixed; bottom: 0px; right: 0px; background: linear-gradient(to right, #da22ff, #9733ee); padding: 10px 15px; -webkit-border-top-left-radius: 15px; -moz-border-radius-topleft: 15px; border-top-left-radius: 15px;"
            >
                <a aria-label="GitHub" href="https://github.com/TeamPiped/Piped">
                    <font-awesome-icon :icon="['fab', 'github']"></font-awesome-icon>
                </a>
                &nbsp;
                <a href="https://github.com/TeamPiped/Piped#donations" :aria-label="$t('actions.donations')" title="$t('actions.donations')">
                    <font-awesome-icon :icon="['fab', 'bitcoin']"></font-awesome-icon>
                </a>
            </div>
        </main>
    </div>
</template>

<script>
import Menu from "@/components/Menu";

import { useIsMobile } from "./store";

export default {
    components: {
        Menu,
    },
    setup() {
        const isMobile = useIsMobile();
        return { isMobile };
    },
    mounted() {
        if (window.location.pathname === "/" || window.location.pathname.length == 0)
            switch (this.getPreferenceString("homepage", "trending")) {
                case "trending":
                    break;
                case "feed":
                    this.$router.push("/feed");
                    return;
                default:
                    break;
            }

        if (this.getPreferenceBoolean("watchHistory", false))
            if ("indexedDB" in window) {
                const request = indexedDB.open("piped-db", 1);
                request.onupgradeneeded = function() {
                    const db = request.result;
                    console.log("Upgrading object store.");
                    if (!db.objectStoreNames.contains("watch_history")) {
                        const store = db.createObjectStore("watch_history", { keyPath: "videoId" });
                        store.createIndex("video_id_idx", "videoId", { unique: true });
                        store.createIndex("id_idx", "id", { unique: true, autoIncrement: true });
                    }
                };
                request.onsuccess = e => {
                    window.db = e.target.result;
                };
            } else console.log("This browser doesn't support IndexedDB");

        const App = this;

        (async function() {
            const locale = App.getPreferenceString("hl", App.defaultLangage);
            if (window.i18n.global.locale.value !== locale) {
                if (!window.i18n.global.availableLocales.includes(locale)) {
                    const messages = await import("@/locales/" + locale + ".json").then(module => module.default);
                    window.i18n.global.setLocaleMessage(locale, messages);
                }
                window.i18n.global.locale.value = locale;
            }
        })();
    },
};
</script>

<style>
h1,
p,
a,
b {
    unicode-bidi: plaintext;
    text-align: start;
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

main {
    background-color: #1d2438;
}

.uk-select {
    background-color: #30354b !important;
    -webkit-border-radius: 20px !important;
    -moz-border-radius: 20px !important;
    border-radius: 20px !important;
    height: auto !important;
    padding: 12px 50px 12px 30px !important;
    background-image: url("/img/arrow-down.png") !important;
    background-size: 30px !important;
    background-position: calc(100% - 15px) 11px !important;
}
</style>
