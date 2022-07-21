<template>
    <nav class="flex flex-wrap items-center justify-center px-2 sm:px-4 py-2.5 w-full relative">
        <div class="flex-1 flex justify-start">
            <router-link class="flex font-bold text-3xl items-center font-sans font-bold" to="/"
                ><img
                    alt="logo"
                    src="/img/icons/logo.svg"
                    height="32"
                    width="32"
                    class="w-10 mr-[-0.6rem]"
                />iped</router-link
            >
        </div>
        <div class="<md:hidden">
            <input
                v-model="searchText"
                class="input !w-72 !h-10"
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
        <div class="flex-1 flex justify-end">
            <ul class="flex text-1xl children:pl-3">
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
                <li v-if="authenticated">
                    <router-link v-t="'titles.feed'" to="/feed" />
                </li>
            </ul>
        </div>
    </nav>
    <div class="w-full md:hidden">
        <input
            v-model="searchText"
            class="input !h-10 !w-full"
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
<style>
.input:focus {
    @apply border-2 border-red-500;
    box-shadow: 0 0 15px rgba(239, 68, 68, var(--tw-border-opacity));
}
</style>
