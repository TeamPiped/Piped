<template>
    <nav class="pp-nav flex flex-wrap items-center justify-center px-2 sm:px-4 py-2.5 w-full relative">
        <div class="flex-1 flex justify-start pp-logo">
            <router-link class="flex font-bold text-3xl items-center font-sans" to="/"
                ><img alt="logo" src="/img/icons/logo.svg" height="32" width="32" />iped</router-link
            >
        </div>
        <div class="lt-md:hidden">
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
        <button class="pp-mobile-btn flex flex-col justify-end mr-3" @click="showTopNav = !showTopNav">
            <i efy_icon="menu" />
        </button>
        <!-- navigation bar for large screen devices -->
        <ul class="flex-1 flex justify-end flex text-1xl children:pl-3">
            <li v-if="shouldShowTrending">
                <router-link v-t="'titles.trending'" to="/trending" />
            </li>
            <li>
                <router-link v-t="'titles.preferences'" to="/preferences" />
            </li>
            <li v-if="shouldShowLogin">
                <p
                    class="cursor-pointer font-bold"
                    v-if="shouldShowLogin"
                    v-t="'titles.account'"
                    @click="showLoginModal = !showLoginModal"
                />
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
    <div v-if="showTopNav" class="pp-mobile-nav flex flex-col" @click="showTopNav = false">
        <router-link v-if="shouldShowTrending" v-t="'titles.trending'" to="/trending" />
        <router-link v-t="'titles.preferences'" to="/preferences" />
        <p
            class="cursor-pointer font-bold"
            v-if="shouldShowLogin"
            v-t="'titles.account'"
            @click="showLoginModal = !showLoginModal"
        />
        <router-link v-if="shouldShowHistory" v-t="'titles.history'" to="/history" />
        <router-link v-if="authenticated" v-t="'titles.playlists'" to="/playlists" />
        <router-link v-if="!shouldShowTrending" v-t="'titles.feed'" to="/feed" />
    </div>
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
        v-show="searchText && suggestionsVisible"
        ref="searchSuggestions"
        :search-text="searchText"
        @searchchange="onSearchTextChange"
    />
    <LoginModal v-if="showLoginModal" @close="showLoginModal = !showLoginModal" />
</template>

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
