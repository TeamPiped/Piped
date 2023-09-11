<template>
    <NavBar />
    <div class="flex-1">
        <router-view v-slot="{ Component }">
            <keep-alive :max="5">
                <component :is="Component" :key="$route.fullPath" />
            </keep-alive>
        </router-view>
    </div>
    <FooterComponent />
</template>

<style>
#app {
    min-height: calc(var(--efy_100vh) - var(--efy_gap2));
    display: flex;
    flex-direction: column;
}

/*Radius*/
input,
.btn,
button,
.pp-show-playlist,
:is(.video-grid, .pp-show-recs, .pp-show-playlist) div,
.grid .comment,
.shaka-scrim-container,
.suggestion-selected,
.pp-mobile-nav a,
.shaka-text-container span > span > span {
    border-radius: var(--efy_radius);
}
.shaka-video-container,
.shaka-video-container video,
video {
    border-radius: var(--efy_radius) !important;
}

.video-card .thumbnail {
    border-radius: var(--efy_radius) var(--efy_radius) 0 0;
}

/*Radius 2*/
.suggestions-container,
.modal-container {
    border-radius: var(--efy_radius2);
}

.pp-full-width :is(.comment, .comment-content) {
    width: 100%;
}
:is(.pp-trans, .pp-solid).shaka-text-container,
:is(.pp-trans, .pp-solid).shaka-text-container * {
    background: transparent !important;
    text-shadow: 0 0 15rem #000 !important;
    backdrop-filter: none !important;
}
.pp-solid.shaka-text-container .shaka-text-wrapper * {
    background: #000 !important;
    backdrop-filter: none !important;
    text-shadow: none !important;
}
.pp-video-card-title {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    padding: 0 10rem 5rem 10rem;
    line-height: 22rem;
    max-height: 43rem;
    overflow: hidden;
    word-break: break-word;
}
.pp-video-card-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: var(--efy_gap0);
    margin: 5rem 10rem 10rem 10rem;
}
.pp-video-card-buttons :is(a, button) {
    padding: 4rem 8rem;
    margin: 0;
    border: var(--efy_border);
    color: var(--efy_text);
    -webkit-text-fill-color: var(--efy_text);
}
.pp-video-card-buttons :is(a:not(.pp-color), button:not(.pp-color)) {
    background: var(--efy_bg1);
}
.pp-video-card-buttons .pp-color {
    color: var(--efy_text2);
    -webkit-text-fill-color: var(--efy_text2);
    border: 0;
    padding: 6rem 10rem;
}
.pp-video-card-buttons :is(.pp-color, .btn, button) {
    height: 35rem;
}
.pp-video-card-channel > .pp-text {
    line-height: 20rem;
    background: var(--efy_bg1) !important;
    border: var(--efy_border) !important;
    display: flex;
    width: fit-content;
    height: 36rem;
    place-items: center;
    padding: 0 10rem;
    overflow: hidden;
}
.pp-video-card-channel > .pp-text span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 160rem;
}
.pp-video-card-channel > .pp-text strong span {
    font-weight: normal;
    font-size: 14rem !important;
}
.pp-video-card-channel {
    display: flex;
    gap: var(--efy_gap0);
    place-items: center;
    background: transparent;
    margin: var(--efy_gap0) 0 var(--efy_gap0) var(--efy_gap0);
    width: fit-content;
    border-radius: var(--efy_radius);
}
.pp-video-card-channel > a {
    height: 36rem;
    width: 36rem;
}
:is(.pp-video-card-channel > a, .pp-video-card-channel > .pp-text):empty {
    display: none;
}
</style>

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
    mounted() {
        this.setTheme();
        darkModePreference.addEventListener("change", () => {
            this.setTheme();
        });

        if ("indexedDB" in window) {
            const request = indexedDB.open("piped-db", 5);
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
                if (!db.objectStoreNames.contains("playlist_bookmarks")) {
                    const store = db.createObjectStore("playlist_bookmarks", { keyPath: "playlistId" });
                    store.createIndex("playlist_id_idx", "playlistId", { unique: true });
                    store.createIndex("id_idx", "id", { unique: true, autoIncrement: true });
                }
                if (!db.objectStoreNames.contains("channel_groups")) {
                    const store = db.createObjectStore("channel_groups", { keyPath: "groupName" });
                    store.createIndex("groupName", "groupName", { unique: true });
                }
                if (!db.objectStoreNames.contains("playlists")) {
                    const playlistStore = db.createObjectStore("playlists", { keyPath: "playlistId" });
                    playlistStore.createIndex("playlistId", "playlistId", { unique: true });
                    const playlistVideosStore = db.createObjectStore("playlist_videos", { keyPath: "videoId" });
                    playlistVideosStore.createIndex("videoId", "videoId", { unique: true });
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
    methods: {
        setTheme() {
            let themePref = this.getPreferenceString("theme", "dark");
            if (themePref == "auto") this.theme = darkModePreference.matches ? "dark" : "light";
            else this.theme = themePref;

            // Change title bar color based on user's theme
            const themeColor = document.querySelector("meta[name='theme-color']");
            if (this.theme === "light") {
                themeColor.setAttribute("content", "#FFF");
            } else {
                themeColor.setAttribute("content", "#0F0F0F");
            }

            // Used for the scrollbar
            const root = document.querySelector(":root");
            this.theme == "dark" ? root.classList.add("dark") : root.classList.remove("dark");
        },
    },
};
</script>
