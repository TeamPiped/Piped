<template>
    <div
        class="uk-container uk-container-expand uk-height-viewport"
        :style="[{ background: backgroundColor, colour: foregroundColor }]"
        :class="{ 'uk-light': darkMode }"
    >
        <Navigation />
        <router-view v-slot="{ Component }">
            <keep-alive :max="5">
                <component :key="$route.fullPath" :is="Component" />
            </keep-alive>
        </router-view>

        <div style="text-align: center">
            <a aria-label="GitHub" href="https://github.com/TeamPiped/Piped">
                <font-awesome-icon :icon="['fab', 'github']"></font-awesome-icon>
            </a>
            &nbsp;
            <a href="https://github.com/TeamPiped/Piped#donations">
                <font-awesome-icon :icon="['fab', 'bitcoin']"></font-awesome-icon>
                {{ $t("actions.donations") }}
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
            const locale = App.getPreferenceString("hl", "en");
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
</style>
