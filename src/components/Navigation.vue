<template>
    <nav class="flex flex-wrap items-center justify-between px-2 sm:px-4 py-2.5 w-full relative">
        <div>
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
                :title="$t('actions.search')"
                :placeholder="$t('actions.search')"
                @keyup="onKeyUp"
                @keypress="onKeyPress"
                @focus="onInputFocus"
                @blur="onInputBlur"
            />
        </div>
        <div class="float-right">
            <ul class="flex text-1xl children:pl-3">
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
import SearchSuggestions from "@/components/SearchSuggestions.vue";

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
    computed: {
        shouldShowLogin(_this) {
            return _this.getAuthToken() == null;
        },
        shouldShowHistory(_this) {
            return _this.getPreferenceBoolean("watchHistory", false);
        },
    },
    methods: {
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
