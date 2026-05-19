<template>
    <!-- Desktop sidebar -->
    <aside
        class="fixed top-0 left-0 z-30 hidden h-full flex-col bg-white shadow-sm transition-all duration-200 md:flex dark:bg-dark-900 dark:shadow-dark-700"
        :class="collapsed ? 'w-14' : 'w-56'"
    >
        <!-- Logo + collapse toggle -->
        <div class="flex h-14 shrink-0 items-center px-3" :class="collapsed ? 'justify-center' : 'justify-between'">
            <router-link v-if="!collapsed" class="flex items-center gap-1 font-sans text-xl font-bold" to="/">
                <img alt="logo" src="/img/icons/logo.svg" height="28" width="28" class="shrink-0" />
                iped
            </router-link>
            <button
                class="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700"
                :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                @click="collapsed = !collapsed"
            >
                <i-fa6-solid-bars />
            </button>
        </div>

        <!-- Search (only when expanded) -->
        <div v-if="!collapsed" class="relative shrink-0 px-3 pb-3">
            <input
                ref="videoSearch"
                v-model="searchText"
                class="h-9 w-full rounded-lg bg-gray-100 px-3 pr-8 text-sm text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none dark:bg-dark-700 dark:text-gray-300"
                type="text"
                role="search"
                :placeholder="$t('actions.search')"
                @keyup="onKeyUp"
                @keypress="onKeyPress"
                @focus="onInputFocus"
                @blur="onInputBlur"
            />
            <i-fa6-solid-magnifying-glass class="absolute top-2 right-5 text-sm text-gray-400" />
            <SearchSuggestions
                v-show="(searchText || showSearchHistory) && suggestionsVisible"
                ref="searchSuggestions"
                :search-text="searchText"
                class="inset-x-3 w-auto"
                @searchchange="onSearchTextChange"
            />
        </div>

        <!-- Nav links -->
        <nav class="flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 pb-2">
            <NavLinkItem
                to="/recommended"
                :collapsed="collapsed"
                :icon="IFa6SolidWandMagicSparkles"
                :label="$t('titles.recommended')"
            />
            <NavLinkItem to="/trending" :collapsed="collapsed" :icon="IFa6SolidFire" :label="$t('titles.trending')" />
            <NavLinkItem to="/shorts" :collapsed="collapsed" :icon="IFa6SolidFilm" :label="$t('titles.shorts')" />
            <NavLinkItem to="/tiktok" :collapsed="collapsed" :icon="IFa6BrandsTiktok" :label="'TikTok'" />

            <hr class="my-1 border-gray-200 dark:border-dark-700" />

            <NavLinkItem to="/feed" :collapsed="collapsed" :icon="IFa6SolidRss" :label="$t('titles.feed')" />
            <NavLinkItem
                to="/subscriptions"
                :collapsed="collapsed"
                :icon="IFa6SolidBell"
                :label="$t('titles.subscriptions')"
            />
            <NavLinkItem
                to="/queue"
                :collapsed="collapsed"
                :icon="IFa6SolidListUl"
                :label="$t('titles.queue')"
                :badge="queueSize > 0 ? queueSize : null"
            />

            <hr class="my-1 border-gray-200 dark:border-dark-700" />

            <NavLinkItem
                v-if="showHistory"
                to="/history"
                :collapsed="collapsed"
                :icon="IFa6SolidClockRotateLeft"
                :label="$t('titles.history')"
            />
            <NavLinkItem to="/playlists" :collapsed="collapsed" :icon="IFa6SolidList" :label="$t('titles.playlists')" />
            <NavLinkItem
                to="/collections"
                :collapsed="collapsed"
                :icon="IFa6SolidLayerGroup"
                :label="$t('titles.collections')"
            />
        </nav>

        <!-- Bottom actions -->
        <div class="shrink-0 border-t border-gray-200 p-2 dark:border-dark-700">
            <NavLinkItem
                to="/preferences"
                :collapsed="collapsed"
                :icon="IFa6SolidGear"
                :label="$t('titles.preferences')"
            />
            <NavLinkItem
                v-if="showLogin"
                to="/login"
                :collapsed="collapsed"
                :icon="IFa6SolidUser"
                :label="$t('titles.login')"
            />
            <NavLinkItem
                v-if="showRegister"
                to="/register"
                :collapsed="collapsed"
                :icon="IFa6SolidUserPlus"
                :label="$t('titles.register')"
            />
            <button
                v-if="!collapsed"
                class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                :title="$t('titles.keyboard_shortcuts')"
                @click="$emit('showShortcuts')"
            >
                <i-fa6-solid-keyboard class="shrink-0" />
                <span class="truncate">{{ $t("titles.keyboard_shortcuts") }}</span>
            </button>
            <button
                v-else
                class="flex w-full items-center justify-center rounded-lg px-2.5 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
                :title="$t('titles.keyboard_shortcuts')"
                @click="$emit('showShortcuts')"
            >
                <i-fa6-solid-keyboard />
            </button>
        </div>
    </aside>

    <!-- Mobile top bar -->
    <div
        class="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-2 bg-white px-3 shadow-sm md:hidden dark:bg-dark-900"
    >
        <button
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700"
            @click="showMobileMenu = !showMobileMenu"
        >
            <i-fa6-solid-bars />
        </button>
        <router-link class="flex items-center gap-1 font-sans text-xl font-bold" to="/">
            <img alt="logo" src="/img/icons/logo.svg" height="26" width="26" />
            iped
        </router-link>
        <div class="relative flex flex-1">
            <input
                v-model="searchText"
                class="h-9 w-full rounded-lg bg-gray-100 px-3 text-sm text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none dark:bg-dark-700 dark:text-gray-300"
                type="text"
                role="search"
                :placeholder="$t('actions.search')"
                @keyup="onKeyUp"
                @keypress="onKeyPress"
                @focus="onInputFocus"
                @blur="onInputBlur"
            />
            <SearchSuggestions
                v-show="(searchText || showSearchHistory) && suggestionsVisible"
                ref="searchSuggestions"
                :search-text="searchText"
                @searchchange="onSearchTextChange"
            />
        </div>
    </div>

    <!-- Mobile menu drawer -->
    <Transition name="slide-left">
        <div v-if="showMobileMenu" class="fixed inset-0 z-40 md:hidden" @click.self="showMobileMenu = false">
            <div class="absolute top-0 left-0 h-full w-64 bg-white shadow-xl dark:bg-dark-900" @click.stop>
                <div class="flex h-14 items-center justify-between px-4">
                    <router-link
                        class="flex items-center gap-1 font-sans text-xl font-bold"
                        to="/"
                        @click="showMobileMenu = false"
                    >
                        <img alt="logo" src="/img/icons/logo.svg" height="26" width="26" />
                        iped
                    </router-link>
                    <button class="p-2" @click="showMobileMenu = false">
                        <i-fa6-solid-xmark />
                    </button>
                </div>
                <nav class="flex flex-col gap-0.5 px-2 pb-4">
                    <MobileNavLinkItem
                        to="/recommended"
                        :label="$t('titles.recommended')"
                        @click="showMobileMenu = false"
                    >
                        <i-fa6-solid-wand-magic-sparkles />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem to="/trending" :label="$t('titles.trending')" @click="showMobileMenu = false">
                        <i-fa6-solid-fire />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem to="/shorts" :label="$t('titles.shorts')" @click="showMobileMenu = false">
                        <i-fa6-solid-film />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem to="/tiktok" label="TikTok" @click="showMobileMenu = false">
                        <i-fa6-brands-tiktok />
                    </MobileNavLinkItem>
                    <hr class="my-1 border-gray-200 dark:border-dark-700" />
                    <MobileNavLinkItem to="/feed" :label="$t('titles.feed')" @click="showMobileMenu = false">
                        <i-fa6-solid-rss />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem
                        to="/subscriptions"
                        :label="$t('titles.subscriptions')"
                        @click="showMobileMenu = false"
                    >
                        <i-fa6-solid-bell />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem to="/queue" :label="$t('titles.queue')" @click="showMobileMenu = false">
                        <i-fa6-solid-list-ul />
                    </MobileNavLinkItem>
                    <hr class="my-1 border-gray-200 dark:border-dark-700" />
                    <MobileNavLinkItem
                        v-if="showHistory"
                        to="/history"
                        :label="$t('titles.history')"
                        @click="showMobileMenu = false"
                    >
                        <i-fa6-solid-clock-rotate-left />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem to="/playlists" :label="$t('titles.playlists')" @click="showMobileMenu = false">
                        <i-fa6-solid-list />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem
                        to="/collections"
                        :label="$t('titles.collections')"
                        @click="showMobileMenu = false"
                    >
                        <i-fa6-solid-layer-group />
                    </MobileNavLinkItem>
                    <hr class="my-1 border-gray-200 dark:border-dark-700" />
                    <MobileNavLinkItem
                        to="/preferences"
                        :label="$t('titles.preferences')"
                        @click="showMobileMenu = false"
                    >
                        <i-fa6-solid-gear />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem
                        v-if="showLogin"
                        to="/login"
                        :label="$t('titles.login')"
                        @click="showMobileMenu = false"
                    >
                        <i-fa6-solid-user />
                    </MobileNavLinkItem>
                    <MobileNavLinkItem
                        v-if="showRegister"
                        to="/register"
                        :label="$t('titles.register')"
                        @click="showMobileMenu = false"
                    >
                        <i-fa6-solid-user-plus />
                    </MobileNavLinkItem>
                </nav>
            </div>
        </div>
    </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import SearchSuggestions from "./SearchSuggestions.vue";
import NavLinkItem from "./NavLinkItem.vue";
import MobileNavLinkItem from "./MobileNavLinkItem.vue";
import hotkeys from "hotkeys-js";
import { fetchJson, authApiUrl, getAuthToken } from "@/composables/useApi.js";
import { getPreferenceBoolean } from "@/composables/usePreferences.js";
import { useQueue } from "@/composables/useQueue.js";

import IFa6SolidWandMagicSparkles from "~icons/fa6-solid/wand-magic-sparkles";
import IFa6SolidFire from "~icons/fa6-solid/fire";
import IFa6SolidFilm from "~icons/fa6-solid/film";
import IFa6BrandsTiktok from "~icons/fa6-brands/tiktok";
import IFa6SolidRss from "~icons/fa6-solid/rss";
import IFa6SolidBell from "~icons/fa6-solid/bell";
import IFa6SolidListUl from "~icons/fa6-solid/list-ul";
import IFa6SolidClockRotateLeft from "~icons/fa6-solid/clock-rotate-left";
import IFa6SolidList from "~icons/fa6-solid/list";
import IFa6SolidLayerGroup from "~icons/fa6-solid/layer-group";
import IFa6SolidGear from "~icons/fa6-solid/gear";
import IFa6SolidUser from "~icons/fa6-solid/user";
import IFa6SolidUserPlus from "~icons/fa6-solid/user-plus";

defineEmits(["showShortcuts"]);

const router = useRouter();
const route = useRoute();

const videoSearch = ref(null);
const searchSuggestions = ref(null);
const searchText = ref("");
const suggestionsVisible = ref(false);
const showMobileMenu = ref(false);
const registrationDisabled = ref(false);
const collapsed = ref(false);

const { queueSize } = useQueue();

const showLogin = computed(() => getAuthToken() == null);
const showRegister = computed(() => !registrationDisabled.value && showLogin.value);
const showHistory = computed(() => getPreferenceBoolean("watchHistory", false));
const showSearchHistory = computed(
    () => getPreferenceBoolean("searchHistory", false) && localStorage.getItem("search_history"),
);

watch(
    () => route.fullPath,
    () => updateSearchTextFromURLSearchParams(),
);

function updateSearchTextFromURLSearchParams() {
    const query = new URLSearchParams(window.location.search).get("search_query");
    if (query) onSearchTextChange(query);
}

function onKeyUp(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") e.preventDefault();
    searchSuggestions.value?.onKeyUp(e);
}

function onKeyPress(e) {
    if (e.key === "Enter") submitSearch(e);
}

function onInputFocus() {
    if (showSearchHistory.value) searchSuggestions.value?.refreshSuggestions();
    suggestionsVisible.value = true;
}

function onInputBlur() {
    setTimeout(() => (suggestionsVisible.value = false), 200);
}

function onSearchTextChange(text) {
    searchText.value = text;
}

function submitSearch(e) {
    e.target?.blur();
    showMobileMenu.value = false;
    if (searchText.value) {
        router.push({ name: "SearchResults", query: { search_query: searchText.value } });
    } else {
        router.push("/");
    }
}

async function fetchAuthConfig() {
    try {
        const config = await fetchJson(authApiUrl() + "/config");
        registrationDisabled.value = config?.registrationDisabled === true;
    } catch {
        // config endpoint unavailable
    }
}

onMounted(() => {
    fetchAuthConfig();
    updateSearchTextFromURLSearchParams();
    hotkeys("ctrl+k", e => {
        e.preventDefault();
        videoSearch.value?.focus();
    });
    // Navigation shortcuts
    hotkeys("g+h", () => router.push("/recommended"));
    hotkeys("g+t", () => router.push("/trending"));
    hotkeys("g+f", () => router.push("/feed"));
    hotkeys("g+s", () => router.push("/shorts"));
    hotkeys("g+q", () => router.push("/queue"));
});
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
    transition: opacity 0.2s;
}
.slide-left-enter-from,
.slide-left-leave-to {
    opacity: 0;
}
</style>
