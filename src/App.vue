<template>
    <div
        class="flex min-h-screen w-full flex-col bg-white px-[1vw] py-5 text-black antialiased dark:bg-dark-900 dark:text-white"
        :class="[theme]"
    >
        <div class="flex-1">
            <NavBar />
            <router-view v-slot="{ Component }">
                <keep-alive :max="5">
                    <component :is="Component" :key="$route.fullPath" />
                </keep-alive>
            </router-view>
        </div>

        <FooterComponent />
    </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import NavBar from "./components/NavBar.vue";
import FooterComponent from "./components/FooterComponent.vue";
import { testLocalStorage, usePreferenceString } from "@/composables/usePreferences.js";
import { getDefaultLanguage, TimeAgo, TimeAgoConfig } from "@/composables/useFormatting.js";
import { fetchSubscriptions } from "@/composables/useSubscriptions.js";
import { getChannelGroups, createOrUpdateChannelGroup } from "@/composables/useChannelGroups.js";

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

const themePreference = usePreferenceString("theme", "dark");
const localePreference = usePreferenceString("hl", "en");
const theme = ref("dark");

function setTheme() {
    const themes = {
        dark: "dark",
        light: "light",
        auto: darkModePreference.matches ? "dark" : "light",
    };

    theme.value = themes[themePreference.value] ?? themes.dark;

    changeTitleBarColor();

    const root = document.querySelector(":root");
    theme.value === "dark" ? root.classList.add("dark") : root.classList.remove("dark");
}

function changeTitleBarColor() {
    const currentColor = { dark: "#0F0F0F", light: "#FFF" };
    const themeColor = document.querySelector("meta[name='theme-color']");
    themeColor.setAttribute("content", currentColor[theme.value]);
}

async function applyLocale(locale = localePreference.value) {
    const resolvedLocale = locale || (await getDefaultLanguage());

    if (resolvedLocale !== TimeAgoConfig.locale) {
        const localeTime = await import(`../node_modules/javascript-time-ago/locale/${resolvedLocale}.json`)
            .catch(() => null)
            .then(module => module?.default);
        if (localeTime) {
            TimeAgo.addLocale(localeTime);
            TimeAgoConfig.locale = resolvedLocale;
        }
    }

    if (window.i18n.global.locale.value !== resolvedLocale) {
        if (!window.i18n.global.availableLocales.includes(resolvedLocale)) {
            const messages = await import(`./locales/${resolvedLocale}.json`).then(module => module.default);
            window.i18n.global.setLocaleMessage(resolvedLocale, messages);
        }
        window.i18n.global.locale.value = resolvedLocale;
    }
}

function handlePreferredColorSchemeChange() {
    if (themePreference.value === "auto") setTheme();
}

watch(
    themePreference,
    () => {
        setTheme();
    },
    { immediate: true },
);

onMounted(() => {
    darkModePreference.addEventListener("change", handlePreferredColorSchemeChange);

    if ("indexedDB" in window) {
        const request = indexedDB.open("piped-db", 7);
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
            if (!db.objectStoreNames.contains("blocked_channels")) {
                const store = db.createObjectStore("blocked_channels", { keyPath: "channelId" });
                store.createIndex("channelId", "channelId", { unique: true });
            }
            // migration to fix an invalid previous length of channel ids: 11 -> 24
            (async () => {
                if (ev.oldVersion < 6) {
                    const subscriptions = await fetchSubscriptions();
                    const channelGroups = await getChannelGroups();
                    for (let group of channelGroups) {
                        for (let i = 0; i < group.channels.length; i++) {
                            const tooShortChannelId = group.channels[i];
                            const foundChannel = subscriptions.find(
                                channel => channel.url.substr(-11) == tooShortChannelId,
                            );
                            if (foundChannel) group.channels[i] = foundChannel.url.substr(-24);
                        }
                        createOrUpdateChannelGroup(group);
                    }
                }
            })();
        };
        request.onsuccess = e => {
            window.db = e.target.result;
        };
    } else console.log("This browser doesn't support IndexedDB");

    (async function () {
        const initialLocale =
            testLocalStorage() && localStorage.getItem("hl") === null
                ? await getDefaultLanguage()
                : localePreference.value;
        await applyLocale(initialLocale);

        watch(localePreference, locale => {
            applyLocale(locale);
        });
    })();
});

onBeforeUnmount(() => {
    darkModePreference.removeEventListener("change", handlePreferredColorSchemeChange);
});
</script>

<style>
@reference "./app.css";

@layer base {
    h1,
    p,
    a,
    b {
        unicode-bidi: plaintext;
        text-align: start;
    }

    :root {
        color-scheme: only light;
        scrollbar-color: #4b4f52 #d1d5db;
    }

    ::-webkit-scrollbar {
        background-color: #d1d5db;
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

    .dark ::-webkit-scrollbar {
        background-color: #15191a;
    }

    .dark ::-webkit-scrollbar-thumb {
        background-color: #4b4f52;
    }

    .dark ::-webkit-scrollbar-thumb:hover {
        background-color: #5b6469;
    }

    .dark ::-webkit-scrollbar-thumb:active {
        background-color: #485053;
    }

    .dark ::-webkit-scrollbar-corner {
        background-color: #0b0e0f;
    }

    :root.dark {
        scrollbar-color: #4b4f52 #15191a;
    }

    * {
        font-family: var(--font-sans);
    }

    hr {
        margin-top: 0.5rem !important;
        margin-bottom: 0.75rem !important;
        border-color: #d1d5db;
    }

    .dark hr {
        border-color: var(--color-dark-100);
    }

    h1,
    h2 {
        margin: 0;
        font-weight: 700;
    }

    h1 {
        font-size: 3rem !important;
        line-height: 1;
    }

    h2 {
        font-size: 1.875rem !important;
        line-height: 2.25rem;
    }
}
</style>
