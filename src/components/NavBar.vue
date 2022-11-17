<template>
    <nav class="flex flex-wrap items-center justify-center px-2 sm:px-4 py-2.5 w-full relative">
        <div class="flex-1 flex justify-start">
            <router-link class="flex font-bold text-3xl items-center font-sans" to="/"
                ><img
                    alt="logo"
                    src="/img/icons/logo.svg"
                    height="32"
                    width="32"
                    class="w-10 mr-[-0.6rem]"
                />iped</router-link
            >
        </div>
        <div class="lt-md:hidden search-container">
            <input
                v-model="searchText"
                class="input w-72 h-10 pr-20"
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
            <span v-if="searchText" class="delete-search" @click="searchText = ''">x</span>
        </div>
        <!-- three vertical lines for toggling the hamburger menu on mobile -->
        <button class="md:hidden flex flex-col justify-end mr-3" @click="showTopNav = !showTopNav">
            <span class="line"></span>
            <span class="line"></span>
            <span class="line"></span>
        </button>
        <!-- navigation bar for large screen devices -->
        <ul class="hidden md:(flex-1 flex justify-end flex text-1xl children:pl-3)">
            <li v-if="shouldShowTrending">
                <router-link v-t="'titles.trending'" to="/trending" />
            </li>
            <li>
                <router-link v-t="'titles.preferences'" to="/preferences" />
            </li>
            <li v-if="shouldShowLogin">
                <router-link v-t="'titles.login'" to="/login" />
            </li>
            <li v-if="shouldShowLogin">
                <router-link v-t="'titles.register'" to="/register" />
            </li>
            <li v-if="shouldShowHistory">
                <router-link v-t="'titles.history'" to="/history" />
            </li>
            <li v-if="authenticated">
                <router-link v-t="'titles.playlists'" to="/playlists" />
            </li>
            <li v-if="!shouldShowTrending">
                <router-link v-t="'titles.feed'" to="/feed" />
            </li>
        </ul>
    </nav>
    <!-- navigation bar for mobile devices -->
    <ul
        v-if="showTopNav"
        class="flex flex-col justify-center items-end mb-4 children:(my-0.5 mr-5)"
        @click="showTopNav = false"
    >
        <li v-if="shouldShowTrending">
            <router-link v-t="'titles.trending'" to="/trending" />
        </li>
        <li>
            <router-link v-t="'titles.preferences'" to="/preferences" />
        </li>
        <li v-if="shouldShowLogin">
            <router-link v-t="'titles.login'" to="/login" />
        </li>
        <li v-if="shouldShowLogin">
            <router-link v-t="'titles.register'" to="/register" />
        </li>
        <li v-if="shouldShowHistory">
            <router-link v-t="'titles.history'" to="/history" />
        </li>
        <li v-if="authenticated">
            <router-link v-t="'titles.playlists'" to="/playlists" />
        </li>
        <li v-if="!shouldShowTrending">
            <router-link v-t="'titles.feed'" to="/feed" />
        </li>
    </ul>
    <!-- search suggestions for mobile devices -->
    <div class="mobile-search md:hidden mx-2 search-container">
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
        <span v-if="searchText" class="delete-search" @click="searchText = ''">x</span>
    </div>
    <SearchSuggestions
        v-show="(searchText || showSearchHistory) && suggestionsVisible"
        ref="searchSuggestions"
        :search-text="searchText"
        @searchchange="onSearchTextChange"
    />
</template>

<script>
import SearchSuggestions from "./SearchSuggestions.vue";
import hotkeys from "hotkeys-js";
export default {
    components: {
        SearchSuggestions,
    },
    data() {
        return {
            searchText: "",
            suggestionsVisible: false,
            showTopNav: false,
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
        showSearchHistory(_this) {
            return _this.getPreferenceBoolean("searchHistory", false) && localStorage.getItem("search_history");
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

<style>
.search-container {
    @apply relative inline-flex items-center;
}
.delete-search {
    @apply absolute right-3 cursor-pointer rounded-full bg-[#ccc] w-4 h-4 text-center text-black opacity-50 hover:(opacity-70) text-size-[13px];
    line-height: 1.05;
}
.mobile-search {
    width: calc(100% - 1rem);
    @apply mx-2;
}
</style>
