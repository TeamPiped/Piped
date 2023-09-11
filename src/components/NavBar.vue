<template>
    <nav class="pp-nav flex flex-wrap items-center justify-center px-2 sm:px-4 py-2.5 w-full relative">
        <div class="flex-1 flex justify-start pp-logo">
            <router-link class="flex font-bold text-3xl items-center font-sans" to="/">
                <svg
                    id="svg-logo"
                    version="1.2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 508 819"
                    width="496"
                    height="800"
                >
                    <linearGradient id="P" gradientUnits="userSpaceOnUse" />
                    <linearGradient id="g1" x1="-169.7" y1="426.7" x2="214.5" y2="352" href="#P">
                        <stop stop-color="hsl(var(--efy_color1_var))" />
                        <stop offset="1" stop-color="hsl(var(--efy_color2_var))" />
                    </linearGradient>
                    <linearGradient id="g2" x1="-7.8" y1="303.4" x2="553.4" y2="194.3" href="#P">
                        <stop stop-color="hsl(var(--efy_color1_var))" />
                        <stop offset="1" stop-color="hsl(var(--efy_color2_var))" />
                    </linearGradient>
                    <linearGradient id="g3" x1="45.4" y1="706.9" x2="13.5" y2="857.1" href="#P">
                        <stop offset=".2" stop-color="#493b32" />
                        <stop offset=".6" stop-color="#dbccc4" />
                    </linearGradient>
                    <linearGradient id="g4" x1="253.6" y1="-66.1" x2="187.8" y2="243.5" href="#P">
                        <stop offset=".2" stop-color="#493b32" />
                        <stop offset=".6" stop-color="#dbccc4" />
                    </linearGradient>
                    <linearGradient id="g5" x1="258.5" y1="231.5" x2="186" y2="572.5" href="#P">
                        <stop offset=".2" stop-color="#493b32" />
                        <stop offset=".6" stop-color="#dbccc4" />
                    </linearGradient>
                    <path
                        class="a"
                        d="m0.4 27.8c0 0 7.3-5.4 20.3-12.7 7.3-3.1 16.4-6.4 26.8-9.3 10.9-2.2 23.1-4 35.6-4.9 12.8 0 25.8 0.8 38 2.4 12.1 2.4 23.3 5.6 32.7 8.9 18.2 8.5 29.6 15.6 29.6 15.6v749.9h-183z"
                    />
                    <path
                        class="b"
                        d="m242.1 163.5c0 0 0-9.7-0.1-22.3-0.2-5.6-0.4-11.9-0.6-18.2-0.2-6.3-0.4-13-0.6-19.9-0.1-7.4-0.1-15.5 0-23.8 0.3-9.3 0.7-19 1.2-28.2 1.3-21.2 2.6-37.7 2.6-37.7 0 0 14.6-1.2 39.3-1.4 5.9 0.4 12.4 1 19.4 1.8 6.9 0.9 14.3 2 22.1 3.5q11.3 2.9 23.4 7.1c8 2.8 16.3 6 24.7 9.7q12 6.5 24.1 14.5 12.1 8 24 17.6 11.3 10.3 22.1 22.1c6.8 8.2 13.4 16.8 19.7 25.9q8.9 14.1 16.8 29.3c4.8 10.4 9.2 21 13.2 32 3.5 11.1 6.6 22.4 9.2 33.9 2.1 11.6 3.7 23.3 4.8 35q1 17.6 0.3 35c-0.9 11.6-2.4 23-4.4 34.2q-0.9 4.1-1.9 8.2-1 4.1-2.1 8.1-1.2 4.1-2.4 8.1-1.2 4-2.5 8-1.5 3.8-3 7.6-1.6 3.8-3.3 7.5-1.6 3.8-3.4 7.4-1.7 3.7-3.6 7.4-2 3.4-4 6.8-2.1 3.4-4.2 6.7-2.2 3.4-4.4 6.6-2.3 3.3-4.6 6.5-2.4 3-4.9 6-2.5 2.9-5.1 5.8-2.6 2.8-5.2 5.6-2.7 2.8-5.4 5.6-2.9 2.4-5.8 4.8-2.9 2.4-5.9 4.7-3 2.3-6 4.6-3.1 2.2-6.2 4.4c-8.1 5.6-16.3 10.8-24.6 15.4-8.9 4-17.8 7.6-26.5 10.7-8.8 3.1-17.3 5.8-25.7 8.1-8.7 1.7-17.2 3.2-25.1 4.4-8 1.1-15.5 2-22.4 2.6-14.5 0.4-26.2 0.5-34.2 0.4-8 0-12.4-0.2-12.4-0.2 0 0 0.3-9.6 0.8-23.1 0.1-6.4 0.3-13.8 0.5-21.6 0.1-7.8 0.1-16.3 0.1-25.1-0.1-9.2-0.2-19-0.5-28.8-0.3-10.5-0.7-21.1-1.2-30.8-1.1-21.5-2.1-37.5-2.1-37.5 0 0 6.9 0.4 18.6 0.5 5.5-0.2 12.1-0.7 19.3-1.6 7-1.3 14.4-3 22-5.3 7.1-2.7 14.3-6.1 21.2-10.1q4.9-3.2 9.4-7 4.3-3.8 8.2-8.2 3.5-4.4 6.6-9.2 2.7-4.9 4.8-10.2 1.8-5.3 3-10.7 0.8-5.6 0.9-11.2-0.2-5.6-1.1-11.2-1.3-5.6-3.2-11-2.2-5.4-5-10.5-3.2-5.1-6.9-9.8-4-4.6-8.4-8.8-4.6-4.1-9.6-7.7c-7.2-4.5-14.5-8.4-21.9-11.7-7.8-2.9-15.5-5.2-22.6-7-7.5-1.5-14.3-2.5-20-3.2-12.1-0.9-19.3-1.1-19.3-1.1z"
                    />
                    <path
                        class="c"
                        d="m92 819c-50.9 0-92-16.5-92-37 0-20.5 41.1-37 92-37 50.9 0 92 16.5 92 37 0 20.5-41.1 37-92 37z"
                    />
                    <path
                        class="d"
                        d="m248.4 165c-22.5 0-40.7-34.1-40.7-76.3 0-42.1 18.2-76.2 40.7-76.2 22.4 0 40.6 34.1 40.6 76.3 0 42.1-18.2 76.2-40.6 76.2z"
                    />
                    <path
                        class="e"
                        d="m249.9 486c-22.5 0-40.6-37.5-40.6-84 0-46.5 18.1-84 40.6-84 22.5 0 40.6 37.6 40.6 84 0 46.5-18.1 84-40.6 84z"
                    /></svg
                >iped</router-link
            >
        </div>
        <div class="lt-md:hidden flex flex-1 justify-start" style="position: relative">
            <input
                ref="videoSearch"
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
                v-t="'titles.account'"
                class="cursor-pointer font-bold"
                @click="showLoginModal = !showLoginModal"
            />
            <router-link v-if="shouldShowHistory" v-t="'titles.history'" to="/history" />
            <router-link v-if="authenticated" v-t="'titles.playlists'" to="/playlists" />
            <router-link v-if="!shouldShowTrending" v-t="'titles.feed'" to="/feed" />
            <button
                efy_sidebar_btn="relative, pp-desktop"
                style="background: transparent; padding: 0; margin: -5rem 0 0 0; border: 0"
                class="efy_trans_filter_off efy_shadow_button_off"
            >
                <i efy_icon="menu" style="margin: 0" />
            </button>
        </div>
    </nav>

    <!-- search suggestions for mobile devices -->
    <div class="w-{full - 4} md:hidden" style="position: relative">
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
            style="margin: 15rem 0 0 0"
        />
        <span v-if="searchText" class="delete-search" @click="searchText = ''">⨉</span>
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
    gap: 15rem;
}
.pp-nav > .pp-logo > a {
    font-size: 25rem;
    font-family: "nunito";
    background: transparent;
    margin-left: 5rem;
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
#svg-logo {
    height: 25rem;
    width: auto;
    margin-right: 2rem;
}
#svg-logo .a {
    fill: url(#g1);
}
#svg-logo .b {
    fill: url(#g2);
}
#svg-logo .c {
    fill: url(#g3);
}
#svg-logo .d {
    fill: url(#g4);
}
#svg-logo .e {
    fill: url(#g5);
}
.delete-search {
    position: absolute;
    display: flex;
    right: 6rem;
    top: 5.5rem;
    height: 30rem;
    width: 30rem;
    cursor: pointer;
    background-color: var(--efy_bg1);
    border: var(--efy_border);
    border-radius: var(--efy_radius0);
    place-content: center;
    font-size: 20rem;
    color: var(--efy_text);
    flex-wrap: wrap;
    align-content: center;
}
</style>

<script>
import SearchSuggestions from "./SearchSuggestions.vue";
import LoginModal from "./LoginModal.vue";
import hotkeys from "hotkeys-js";
export default {
    components: {
        SearchSuggestions,
        LoginModal,
    },
    data() {
        return {
            searchText: "",
            suggestionsVisible: false,
            showLoginModal: false,
            showTopNav: false,
            homePagePath: "/",
            registrationDisabled: false,
        };
    },
    computed: {
        shouldShowLogin(_this) {
            return _this.getAuthToken() == null;
        },
        shouldShowRegister(_this) {
            return _this.registrationDisabled == false ? _this.shouldShowLogin : false;
        },
        shouldShowHistory(_this) {
            return _this.getPreferenceBoolean("watchHistory", false);
        },
        shouldShowTrending(_this) {
            return _this.getPreferenceString("homepage", "trending") != "trending";
        },
        showSearchHistory(_this) {
            return _this.getPreferenceBoolean("searchHistory", false) && localStorage.getItem("search_history");
        },
    },
    mounted() {
        this.fetchAuthConfig();
        const query = new URLSearchParams(window.location.search).get("search_query");
        if (query) this.onSearchTextChange(query);
        this.focusOnSearchBar();
        this.homePagePath = this.getHomePage(this);
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
                this.submitSearch(e);
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
        async fetchAuthConfig() {
            this.fetchJson(this.authApiUrl() + "/config").then(config => {
                this.registrationDisabled = config?.registrationDisabled === true;
            });
        },
        onSearchClick(e) {
            this.submitSearch(e);
        },
        submitSearch(e) {
            e.target.blur();
            this.$router.push({
                name: "SearchResults",
                query: { search_query: this.searchText },
            });
            return;
        },
    },
};
</script>
