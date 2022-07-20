<template>
    <div class="w-full min-h-screen px-1vw reset" :class="[theme]">
        <NavBar />
        <router-view v-slot="{ Component }">
            <keep-alive :max="5">
                <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
        </router-view>

        <footer class="text-center my-2">
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
    @apply font-sans;
}

.video-grid {
    @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 col-auto <md:gap-x-2.5 md:gap-x-1vw gap-y-1.5;
}

.btn {
    @apply py-2 px-4 rounded cursor-pointer;
}

.reset {
    @apply text-black bg-white;
}

.auto {
    @apply dark:(text-white bg-dark-900);
}

.dark {
    @apply text-white bg-dark-900;
}

.input,
.select,
.btn {
    @apply w-auto text-gray-600 bg-gray-300;
}

.input,
.select {
    @apply h-8;
}

.btn {
    @apply h-full;
}

.checkbox {
    @apply h-4 w-4;
}

.dark .input,
.dark .select,
.dark .btn {
    @apply text-gray-400 bg-dark-400;
}

.auto .input,
.auto .select,
.auto .btn {
    @apply dark:(text-gray-400 bg-dark-400);
}

.input {
    @apply pl-2.5;
}

hr {
    @apply !mt-2 !mb-3 border-gray-300;
}

.dark hr {
    @apply border-dark-100;
}

.auto hr {
    @apply dark:border-dark-100;
}

h1,
h2 {
    @apply m-0 font-bold;
}

h1 {
    @apply !text-5xl;
}

h2 {
    @apply !text-3xl;
}

.table {
    @apply w-full text-lg text-left font-light border;
}

.link {
    @apply hover:(text-dark-300 underline underline-dark-300);
}

.link-secondary {
    @apply hover:(text-dark-400 underline underline-dark-400);
}

.dark .link {
    @apply hover:(text-gray-300 underline underline-gray-300);
}

.auto .link {
    @apply dark:hover:(text-gray-300 underline underline-gray-300);
}

.dark .link-secondary {
    @apply text-gray-300 hover:(text-gray-400 underline underline-gray-400);
}

.auto .link-secondary {
    @apply dark:(text-gray-300 hover:(text-gray-400 underline underline-gray-400));
}
</style>
