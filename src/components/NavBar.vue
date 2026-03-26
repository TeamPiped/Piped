<template>
    <nav class="relative w-full flex flex-wrap items-center justify-center px-2 pb-2.5 sm:px-4">
        <div class="flex flex-1 justify-start">
            <router-link class="flex items-center text-3xl font-bold font-sans" :to="homePagePath"
                ><img
                    alt="logo"
                    src="/img/icons/logo.svg"
                    height="32"
                    width="32"
                    class="mr-[-0.6rem] w-10"
                />iped</router-link
            >
        </div>
        <div class="search-container lt-md:hidden">
            <input
                ref="videoSearch"
                v-model="searchText"
                class="input h-10 w-72 pr-20"
                type="text"
                role="search"
                :title="$t('actions.search')"
                :placeholder="$t('actions.search')"
                @keyup="onKeyUp"
                @keypress="onKeyPress"
                @focus="onInputFocus"
                @blur="onInputBlur"
            />
            <span v-if="searchText" class="delete-search" @click="searchText = ''">⨉</span>
        </div>
        <button id="search-btn" class="input btn mx-1 h-10" @click="onSearchClick">
            <div class="i-fa6-solid:magnifying-glass"></div>
        </button>
        <!-- three vertical lines for toggling the hamburger menu on mobile -->
        <button class="mr-3 flex flex-col justify-end md:hidden" @click="showTopNav = !showTopNav">
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
        </button>
        <!-- navigation bar for large screen devices -->
        <ul class="md:text-1xl hidden list-none md:(flex flex flex-1 justify-end children:pl-3)">
            <li v-if="shouldShowTrending">
                <router-link v-t="'titles.trending'" to="/trending" class="nav-link" />
            </li>
            <li>
                <router-link v-t="'titles.preferences'" to="/preferences" class="nav-link" />
            </li>
            <li v-if="shouldShowLogin">
                <router-link v-t="'titles.login'" to="/login" class="nav-link" />
            </li>
            <li v-if="shouldShowRegister">
                <router-link v-t="'titles.register'" to="/register" class="nav-link" />
            </li>
            <li v-if="shouldShowHistory">
                <router-link v-t="'titles.history'" to="/history" class="nav-link" />
            </li>
            <li>
                <router-link v-t="'titles.playlists'" to="/playlists" class="nav-link" />
            </li>
            <li v-if="!shouldShowTrending">
                <router-link v-t="'titles.feed'" to="/feed" class="nav-link" />
            </li>
        </ul>
    </nav>
    <!-- navigation bar for mobile devices -->
    <div
        v-if="showTopNav"
        class="mobile-nav mb-4 flex flex-col children:(w-full flex items-center gap-1 border-b border-dark-100 p-1)"
    >
        <router-link v-if="shouldShowTrending" to="/trending">
            <div class="i-fa6-solid:fire"></div>
            <i18n-t keypath="titles.trending"></i18n-t>
        </router-link>
        <router-link to="/preferences">
            <div class="i-fa6-solid:gear"></div>
            <i18n-t keypath="titles.preferences"></i18n-t>
        </router-link>
        <router-link v-if="shouldShowLogin" to="/login">
            <div class="i-fa6-solid:user"></div>
            <i18n-t keypath="titles.login"></i18n-t>
        </router-link>
        <router-link v-if="shouldShowLogin" to="/register">
            <div class="i-fa6-solid:user-plus"></div>
            <i18n-t keypath="titles.register"></i18n-t>
        </router-link>
        <router-link v-if="shouldShowHistory" to="/history">
            <div class="i-fa6-solid:clock-rotate-left"></div>
            <i18n-t keypath="titles.history"></i18n-t>
        </router-link>
        <router-link to="/playlists">
            <div class="i-fa6-solid:list"></div>
            <i18n-t keypath="titles.playlists"></i18n-t>
        </router-link>
        <router-link v-if="!shouldShowTrending" to="/feed">
            <div class="i-fa6-solid:play"></div>
            <i18n-t keypath="titles.feed"></i18n-t>
        </router-link>
    </div>
    <!-- search suggestions for mobile devices -->
    <div class="search-container mb-2 w-full md:hidden">
        <input
            v-model="searchText"
            class="input h-10 w-full"
            type="text"
            role="search"
            :title="$t('actions.search')"
            :placeholder="$t('actions.search')"
            @keyup="onKeyUp"
            @keypress="onKeyPress"
            @focus="onInputFocus"
            @blur="onInputBlur"
        />
        <span v-if="searchText" class="delete-search" @click="searchText = ''">⨉</span>
    </div>
    <SearchSuggestions
        v-show="(searchText || showSearchHistory) && suggestionsVisible"
        ref="searchSuggestions"
        :search-text="searchText"
        @searchchange="onSearchTextChange"
    />
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import SearchSuggestions from "./SearchSuggestions.vue";
import hotkeys from "hotkeys-js";
import { fetchJson, authApiUrl, getAuthToken } from "@/composables/useApi.js";
import { getPreferenceBoolean, getPreferenceString } from "@/composables/usePreferences.js";
import { getHomePage } from "@/composables/useMisc.js";

const router = useRouter();
const route = useRoute();

const videoSearch = ref(null);
const searchSuggestions = ref(null);

const searchText = ref("");
const suggestionsVisible = ref(false);
const showTopNav = ref(false);
const homePagePath = ref(import.meta.env.BASE_URL);
const registrationDisabled = ref(false);

const shouldShowLogin = computed(() => {
    return getAuthToken() == null;
});

const shouldShowRegister = computed(() => {
    return registrationDisabled.value == false ? shouldShowLogin.value : false;
});

const shouldShowHistory = computed(() => {
    return getPreferenceBoolean("watchHistory", false);
});

const shouldShowTrending = computed(() => {
    return getPreferenceString("homepage", "trending") != "trending";
});

const showSearchHistory = computed(() => {
    return getPreferenceBoolean("searchHistory", false) && localStorage.getItem("search_history");
});

watch(
    () => route.fullPath,
    () => {
        updateSearchTextFromURLSearchParams();
    },
);

function updateSearchTextFromURLSearchParams() {
    const query = new URLSearchParams(window.location.search).get("search_query");
    if (query) onSearchTextChange(query);
}

function focusOnSearchBar() {
    hotkeys("ctrl+k", event => {
        event.preventDefault();
        videoSearch.value.focus();
    });
}

function onKeyUp(e) {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
    }
    searchSuggestions.value.onKeyUp(e);
}

function onKeyPress(e) {
    if (e.key === "Enter") {
        submitSearch(e);
    }
}

function onInputFocus() {
    if (showSearchHistory.value) searchSuggestions.value.refreshSuggestions();
    suggestionsVisible.value = true;
}

function onInputBlur() {
    setTimeout(() => (suggestionsVisible.value = false), 200);
}

function onSearchTextChange(text) {
    searchText.value = text;
}

async function fetchAuthConfig() {
    fetchJson(authApiUrl() + "/config").then(config => {
        registrationDisabled.value = config?.registrationDisabled === true;
    });
}

function onSearchClick(e) {
    submitSearch(e);
}

function submitSearch(e) {
    e.target.blur();
    if (searchText.value) {
        router.push({
            name: "SearchResults",
            query: { search_query: searchText.value },
        });
    } else {
        router.push("/");
    }
    return;
}

onMounted(() => {
    fetchAuthConfig();
    updateSearchTextFromURLSearchParams();
    focusOnSearchBar();
    homePagePath.value = getHomePage();
});
</script>

<style>
.search-container {
    @apply relative inline-flex items-center;
}
.delete-search {
    @apply absolute right-3 cursor-pointer rounded-full bg-[#ccc] w-4 h-4 text-center text-black opacity-50 hover:(opacity-70) text-size-[10px];
}
.mobile-nav div {
    @apply mx-1;
}

#search-btn:hover {
    @apply bg-red-400;
}

.dark #search-btn:hover {
    @apply bg-dark-100;
}

.nav-link {
    @apply hover:text-red-500;
}

.dark .nav-link {
    @apply hover:text-red-400;
}

@media screen and (max-width: 848px) {
    #search-btn {
        display: none;
    }
}
</style>
