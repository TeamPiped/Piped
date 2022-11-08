<template>
    <nav class="pp-nav flex flex-wrap items-center justify-center px-2 sm:px-4 py-2.5 w-full relative">
        <div class="flex-1 flex justify-start pp-logo">
            <router-link class="flex font-bold text-3xl items-center font-sans" to="/"
                ><img alt="logo" src="/img/icons/logo.svg" height="32" width="32" />iped</router-link
            >
        </div>
        <div class="lt-md:hidden flex flex-1 justify-start">
            <input
                v-model="searchText"
                type="text"
                role="search"
                ref="videoSearch"
                :title="$t('actions.search')"
                :placeholder="$t('actions.search')"
                @keyup="onKeyUp"
                @keypress="onKeyPress"
                @focus="onInputFocus"
                @blur="onInputBlur"
            />
        </div>
        <!-- hamburger menu on mobile -->
        <button class="pp-mobile-btn" efy_sidebar_btn="relative, pp-mobile">
            <i efy_icon="menu" />
        </button>
        <!-- navigation bar for large screen devices -->
        <div class="pp-menu flex justify-end children:pl-3">
            <router-link v-if="shouldShowTrending" v-t="'titles.trending'" to="/trending" />
            <router-link v-t="'titles.preferences'" to="/preferences" />
            <p
                v-if="shouldShowLogin"
                class="cursor-pointer font-bold"
                v-t="'titles.account'"
                @click="showLoginModal = !showLoginModal"
            />
            <router-link v-if="shouldShowHistory" v-t="'titles.history'" to="/history" />
            <router-link v-if="authenticated" v-t="'titles.playlists'" to="/playlists" />
            <router-link v-if="!shouldShowTrending" v-t="'titles.feed'" to="/feed" />
            <button
                efy_sidebar_btn="relative, pp-desktop"
                style="
                    background: transparent;
                    -webkit-text-fill-color: var(--efy_text);
                    padding: 0;
                    margin: -5rem 0 0 0;
                    border: 0;
                    backdrop-filter: none !important;
                    -webkit-backdrop-filter: none !important;
                "
            >
                <i efy_icon="menu" style="margin: 0" />
            </button>
        </div>
    </nav>

    <!-- search suggestions for mobile devices -->
    <div class="w-{full - 4} md:hidden mx-2">
        <input
            v-model="searchText"
            type="text"
            role="search"
            :title="$t('actions.search')"
            :placeholder="$t('actions.search')"
            @keyup="onKeyUp"
            @keypress="onKeyPress"
            @focus="onInputFocus"
            @blur="onInputBlur"
        />
    </div>
    <SearchSuggestions
        v-show="(searchText || showSearchHistory) && suggestionsVisible"
        ref="searchSuggestions"
        :search-text="searchText"
        @searchchange="onSearchTextChange"
    />
    <LoginModal v-if="showLoginModal" @close="showLoginModal = !showLoginModal" />
</template>

<style>
.pp-nav {
    margin-bottom: 15rem;
    gap: 15rem;
}
.pp-nav > .pp-logo > a {
    font-size: 25rem;
    font-family: "nunito";
    background: transparent;
}
.pp-nav > div input {
    margin: 0 !important;
    width: 300rem;
}
.pp-nav .pp-menu {
    list-style: none;
    display: flex;
    gap: 15rem;
    margin: 0;
    padding: 0;
}
.pp-nav .pp-menu > * {
    margin: 0;
}
.pp-logo img {
    width: auto;
    margin: 0 -5rem;
}
</style>

<script>
import SearchSuggestions from "./SearchSuggestions.vue";
import hotkeys from "hotkeys-js";
import LoginModal from "./LoginModal.vue";
export default {
    components: {
        SearchSuggestions,
        LoginModal,
    },
    data() {
        return {
            searchText: "",
            suggestionsVisible: false,
            showTopNav: false,
            showLoginModal: false,
        };
    },
    mounted() {
        const query = new URLSearchParams(window.location.search).get("search_query");
        if (query) this.onSearchTextChange(query);
        this.focusOnSearchBar();
    },
    computed: {
        shouldShowLogin(_this) {
            return _this.getAuthToken() == null;
        },
        shouldShowHistory(_this) {
            return _this.getPreferenceBoolean("watchHistory", false);
        },
        shouldShowTrending(_this) {
            return _this.getPreferenceString("homepage", "trending") != "trending";
        },
        showSearchHistory() {
            return localStorage.getItem("searchHistory") && localStorage.getItem("search_history");
        },
    },
    methods: {
        // focus on search bar when Ctrl+k is pressed
        focusOnSearchBar() {
            hotkeys("ctrl+k", event => {
                event.preventDefault();
                this.$refs.videoSearch.focus();
            });
        },
        onKeyUp(e) {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
            }
            this.$refs.searchSuggestions.onKeyUp(e);
        },
        onKeyPress(e) {
            if (e.key === "Enter") {
                e.target.blur();
                this.$router.push({
                    name: "SearchResults",
                    query: { search_query: this.searchText },
                });
                return;
            }
        },
        onInputFocus() {
            if (this.showSearchHistory) this.$refs.searchSuggestions.refreshSuggestions();
            this.suggestionsVisible = true;
        },
        onInputBlur() {
            this.suggestionsVisible = false;
        },
        onSearchTextChange(searchText) {
            this.searchText = searchText;
        },
    },
};
</script>
