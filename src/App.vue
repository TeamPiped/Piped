<template>
    <div class="w-full min-h-screen px-1vw reset" :class="[theme]">
        <NavBar />

        <router-view v-slot="{ Component }">
            <keep-alive :max="5">
                <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
        </router-view>

        <FooterComponent />
    </div>
</template>

<script>
import NavBar from "./components/NavBar.vue";
import FooterComponent from "./components/FooterComponent.vue";

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

export default {
    components: {
        NavBar,
        FooterComponent,
    },
    data() {
        return {
            theme: "dark",
        };
    },
    methods: {
        setTheme() {
            let themePref = this.getPreferenceString("theme", "dark");
            if (themePref == "auto") this.theme = darkModePreference.matches ? "dark" : "light";
            else this.theme = themePref;
        },
    },
    mounted() {
        this.setTheme();
        darkModePreference.addEventListener("change", () => {
            this.setTheme();
        });
        if (this.getPreferenceBoolean("watchHistory", false))
            if ("indexedDB" in window) {
                const request = indexedDB.open("piped-db", 2);
                request.onupgradeneeded = ev => {
                    const db = request.result;
                    console.log("Upgrading object store.");
                    if (!db.objectStoreNames.contains("watch_history")) {
                        const store = db.createObjectStore("watch_history", { keyPath: "videoId" });
                        store.createIndex("video_id_idx", "videoId", { unique: true });
                        store.createIndex("id_idx", "id", { unique: true, autoIncrement: true });
                    }
                    if (ev.oldVersion < 2) {
                        const store = request.transaction.objectStore("watch_history");
                        store.createIndex("watchedAt", "watchedAt", { unique: false });
                    }
                };
                request.onsuccess = e => {
                    window.db = e.target.result;
                };
            } else console.log("This browser doesn't support IndexedDB");

        const App = this;

        (async function () {
            const defaultLang = await App.defaultLanguage;
            const locale = App.getPreferenceString("hl", defaultLang);
            if (locale !== App.TimeAgoConfig.locale) {
                const localeTime = await import(`../node_modules/javascript-time-ago/locale/${locale}.json`)
                    .catch(() => null)
                    .then(module => module?.default);
                if (localeTime) {
                    App.TimeAgo.addLocale(localeTime);
                    App.TimeAgoConfig.locale = locale;
                }
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
    @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 col-auto lt-md:gap-x-2.5 md:gap-x-1vw gap-y-1.5;
}

.btn {
    @apply py-2 lt-md:px-2 md:px-4 rounded cursor-pointer inline-block;
}

.reset {
    @apply text-black bg-white;
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

.checkbox {
    @apply h-4 w-4;
}

.dark .input,
.dark .select,
.dark .btn {
    @apply text-gray-400 bg-dark-400;
}

.input {
    @apply pl-2.5;
}

.input:focus {
    @apply border-2 border-red-500 outline-none;
    box-shadow: 0 0 15px rgba(239, 68, 68, var(--un-border-opacity));
}

hr {
    @apply !mt-2 !mb-3 border-gray-300;
}

.dark hr {
    @apply border-dark-100;
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

.dark .link-secondary {
    @apply text-gray-300 hover:(text-gray-400 underline underline-gray-400);
}

.line {
    @apply px-2.5 py-0.25 my-0.45 rounded-xl bg-dark-900;
}

.dark .line {
    @apply bg-white;
}

.thumbnail-overlay {
    @apply rounded-md absolute bg-black text-white bg-opacity-75 px-5px;
}

.thumbnail-right {
    @apply bottom-5px right-5px;
}
.thumbnail-left {
    @apply bottom-5px left-5px text-xs font-bold bg-red-600 uppercase;
}
</style>
