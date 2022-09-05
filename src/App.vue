<template>
    <div class="w-full min-h-screen px-1vw reset" :class="[theme]">
        <NavBar />
        <router-view v-slot="{ Component }">
            <keep-alive :max="5">
                <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
        </router-view>

        <footer class="text-center">
            <a aria-label="GitHub" href="https://github.com/TeamPiped/Piped">
                <font-awesome-icon :icon="['fab', 'github']" />
            </a>
            <a class="ml-2" href="https://github.com/TeamPiped/Piped#donations">
                <font-awesome-icon :icon="['fab', 'bitcoin']" />
                <span class="ml-1" v-t="'actions.donations'" />
            </a>
        </footer>
    </div>
</template>

<script>
import NavBar from "./components/NavBar.vue";
export default {
    components: {
        NavBar,
    },
    mounted() {
        if (this.getPreferenceBoolean("watchHistory", false))
            if ("indexedDB" in window) {
                const request = indexedDB.open("piped-db", 1);
                request.onupgradeneeded = function () {
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

        (async function () {
            const defaultLang = await App.defaultLangage;
            const locale = App.getPreferenceString("hl", defaultLang);
            if (locale !== App.TimeAgoConfig.locale) {
                const localeTime = await import(
                    "./../node_modules/javascript-time-ago/locale/" + locale + ".json"
                ).then(module => module.default);
                App.TimeAgo.addLocale(localeTime);
                App.TimeAgoConfig.locale = locale;
            }
            if (window.i18n.global.locale.value !== locale) {
                if (!window.i18n.global.availableLocales.includes(locale)) {
                    const messages = await import(`./locales/${locale}.json`).then(module => module.default);
                    window.i18n.global.setLocaleMessage(locale, messages);
                }
                window.i18n.global.locale.value = locale;
            }
        })();
    },
};
</script>
