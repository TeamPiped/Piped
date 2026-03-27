<template>
    <nav class="relative flex w-full flex-wrap items-center justify-center px-2 pb-2.5 sm:px-4">
        <div class="flex flex-1 justify-start">
            <router-link class="flex items-center font-sans text-3xl font-bold" :to="homePagePath"
                ><img
                    alt="logo"
                    src="/img/icons/logo.svg"
                    height="32"
                    width="32"
                    class="mr-[-0.6rem] w-10"
                />iped</router-link
            >
        </div>
        <div class="relative inline-flex items-center max-md:hidden">
            <input
                ref="videoSearch"
                v-model="searchText"
                class="h-10 w-72 rounded-md bg-gray-300 px-2.5 pr-20 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                type="text"
                role="search"
                :title="$t('actions.search')"
                :placeholder="$t('actions.search')"
                @keyup="onKeyUp"
                @keypress="onKeyPress"
                @focus="onInputFocus"
                @blur="onInputBlur"
            />
            <ClearButton v-if="searchText" @clear="searchText = ''" />
        </div>
        <button
            id="search-btn"
            class="mx-1 hidden h-10 w-auto cursor-pointer rounded-sm bg-gray-300 px-2.5 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-[848px]:hidden max-md:px-2 min-[848px]:inline-block md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            @click="onSearchClick"
        >
            <i-fa6-solid-magnifying-glass />
        </button>
        <!-- three vertical lines for toggling the hamburger menu on mobile -->
        <button class="mr-3 flex flex-col justify-end md:hidden" @click="showTopNav = !showTopNav">
            <span class="my-[0.1125rem] rounded-xl bg-dark-900 px-2.5 py-px dark:bg-white"></span>
            <span class="my-[0.1125rem] rounded-xl bg-dark-900 px-2.5 py-px dark:bg-white"></span>
            <span class="my-[0.1125rem] rounded-xl bg-dark-900 px-2.5 py-px dark:bg-white"></span>
        </button>
        <!-- navigation bar for large screen devices -->
        <ul class="hidden list-none *:pl-3 md:flex md:flex-1 md:justify-end">
            <li v-if="shouldShowTrending">
                <router-link
                    v-t="'titles.trending'"
                    to="/trending"
                    class="hover:text-red-500 dark:hover:text-red-400"
                />
            </li>
            <li>
                <router-link
                    v-t="'titles.preferences'"
                    to="/preferences"
                    class="hover:text-red-500 dark:hover:text-red-400"
                />
            </li>
            <li v-if="shouldShowLogin">
                <router-link v-t="'titles.login'" to="/login" class="hover:text-red-500 dark:hover:text-red-400" />
            </li>
            <li v-if="shouldShowRegister">
                <router-link
                    v-t="'titles.register'"
                    to="/register"
                    class="hover:text-red-500 dark:hover:text-red-400"
                />
            </li>
            <li v-if="shouldShowHistory">
                <router-link v-t="'titles.history'" to="/history" class="hover:text-red-500 dark:hover:text-red-400" />
            </li>
            <li>
                <router-link
                    v-t="'titles.playlists'"
                    to="/playlists"
                    class="hover:text-red-500 dark:hover:text-red-400"
                />
            </li>
            <li v-if="!shouldShowTrending">
                <router-link v-t="'titles.feed'" to="/feed" class="hover:text-red-500 dark:hover:text-red-400" />
            </li>
        </ul>
    </nav>
    <!-- navigation bar for mobile devices -->
    <div
        v-if="showTopNav"
        class="mb-4 flex flex-col *:flex *:w-full *:items-center *:gap-1 *:border-b *:border-dark-100 *:p-1"
    >
        <router-link v-if="shouldShowTrending" to="/trending">
            <i-fa6-solid-fire />
            <i18n-t keypath="titles.trending"></i18n-t>
        </router-link>
        <router-link to="/preferences">
            <i-fa6-solid-gear />
            <i18n-t keypath="titles.preferences"></i18n-t>
        </router-link>
        <router-link v-if="shouldShowLogin" to="/login">
            <i-fa6-solid-user />
            <i18n-t keypath="titles.login"></i18n-t>
        </router-link>
        <router-link v-if="shouldShowLogin" to="/register">
            <i-fa6-solid-user-plus />
            <i18n-t keypath="titles.register"></i18n-t>
        </router-link>
        <router-link v-if="shouldShowHistory" to="/history">
            <i-fa6-solid-clock-rotate-left />
            <i18n-t keypath="titles.history"></i18n-t>
        </router-link>
        <router-link to="/playlists">
            <i-fa6-solid-list />
            <i18n-t keypath="titles.playlists"></i18n-t>
        </router-link>
        <router-link v-if="!shouldShowTrending" to="/feed">
            <i-fa6-solid-play />
            <i18n-t keypath="titles.feed"></i18n-t>
        </router-link>
    </div>
    <!-- search suggestions for mobile devices -->
    <div class="relative mb-2 inline-flex w-full items-center md:hidden">
        <input
            v-model="searchText"
            class="h-10 w-full rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
            type="text"
            role="search"
            :title="$t('actions.search')"
            :placeholder="$t('actions.search')"
            @keyup="onKeyUp"
            @keypress="onKeyPress"
            @focus="onInputFocus"
            @blur="onInputBlur"
        />
        <ClearButton v-if="searchText" @clear="searchText = ''" />\n
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
import ClearButton from "./ui/ClearButton.vue";
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

<style></style>
