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

<style>
/*Global*/
:root {
    --efy_color1_var: 239, 68, 68;
    --efy_color2_var: 220, 38, 38;
    --efy_radius: 12rem;
    --efy_sidebar_button: right_middle;
    --efy_font_family: "nunito", sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
        Noto Sans, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
    --efy_body_width: unset;
    --efy_audio_path: ./audio;
    --efy_modules: efy_quick, efy_mode, efy_filters, efy_backup, efy_accessibility, efy_audio;

    --efy_module_quick: on;
    --efy_module_mode: on;
    --efy_module_filters: on;
    --efy_module_backup: on;
    --efy_module_accessibility: on;
    --efy_module_audio: on;
}

body {
    @apply max-w-100vw p-16rem;
}

/*Default Mode*/
[efy_mode="default_mode"] {
    color-scheme: dark;
    --efy_bg_var: 255, 255, 255;
    --efy_bg: rgb(15, 15, 15);
    --efy_text: rgb(220, 220, 220);
}

/*Radius*/
input,
.btn,
button,
.shaka-video-container,
.shaka-video-container video,
.video-grid div,
.pp-show-recs div,
.grid .comment,
.shaka-scrim-container,
.suggestion-selected,
.pp-mobile-nav a,
.shaka-text-container span > span > span {
    border-radius: var(--efy_radius);
}

/*Radius 0*/
.video-grid img,
.thumbnail-overlay,
.thumbnail-left,
.thumbnail-right {
    border-radius: var(--efy_radius0);
}

/*Radius 2*/
.suggestions-container,
.modal-container {
    border-radius: var(--efy_radius2);
}
</style>

<script>
import NavBar from "./components/NavBar.vue";
import FooterComponent from "./components/FooterComponent.vue";
export default {
    components: {
        NavBar,
        FooterComponent,
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
    @apply grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 col-auto lt-md:gap-x-2.5 md:gap-x-1vw gap-y-1.5;
}

.btn {
    @apply h-full py-2 lt-md:px-2 md:px-4 rounded cursor-pointer;
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

.line {
    @apply px-2.5 py-0.25 my-0.45 rounded-xl bg-dark-900;
}

.dark .line {
    @apply bg-white;
}

.auto .line {
    @apply dark:(bg-white);
}
</style>
