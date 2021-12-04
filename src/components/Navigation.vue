<template>
    <nav
        class="uk-navbar uk-navbar-container uk-container-expand uk-position-relative"
        :style="[{ background: backgroundColor, colour: foregroundColor }]"
        uk-navbar
    >
        <div class="uk-navbar-left">
            <router-link class="uk-navbar-item uk-logo uk-text-bold" :style="[{ colour: foregroundColor }]" to="/"
                ><img
                    alt="logo"
                    src="/img/icons/logo.svg"
                    height="32"
                    width="32"
                    style="margin-bottom: 6px; margin-right: -13px"
                />iped</router-link
            >
        </div>
        <div class="uk-navbar-center uk-flex uk-visible@m">
            <input
                v-model="searchText"
                class="uk-input uk-width-medium"
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
        <div class="uk-navbar-right">
            <ul class="uk-navbar-nav">
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
    <div class="uk-container-expand uk-hidden@m">
        <input
            v-model="searchText"
            class="uk-input"
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
import SearchSuggestions from "@/components/SearchSuggestions";

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

<style></style>
