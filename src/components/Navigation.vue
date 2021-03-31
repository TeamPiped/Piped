<template
    ><nav
        class="uk-navbar-container uk-container-expand uk-position-relative uk-light"
        style="background: #0b0e0f"
        uk-navbar
    >
        <div class="uk-navbar-left">
            <router-link class="uk-navbar-item uk-logo uk-text-bold" to="/"
                ><img
                    src="/img/icons/logo.svg"
                    height="32"
                    width="32"
                />iped</router-link
            >
        </div>
        <div class="uk-navbar-center uk-flex uk-visible@m">
            <input
                class="uk-input"
                type="text"
                placeholder="Search"
                v-model="searchText"
                @keypress="onChange($event)"
                @focus="onInputFocus"
                @blur="onInputBlur"
            />
        </div>
        <div class="uk-navbar-right">
            <ul class="uk-navbar-nav">
                <li>
                    <router-link to="/preferences">Preferences</router-link>
                </li>
                <li>
                    <router-link to="/login">Login</router-link>
                </li>
                <li>
                    <router-link to="/feed">Feed</router-link>
                </li>
            </ul>
        </div>
    </nav>
    <div class="uk-container-expand uk-hidden@m">
        <input
            class="uk-input"
            type="text"
            placeholder="Search"
            v-model="searchText"
            @keypress="onChange($event)"
            @focus="onInputFocus"
            @blur="onInputBlur"
        />
    </div>
    <SearchSuggestions
        v-if="searchText && suggestionsVisible && searchSuggestions.length > 0"
        :searchSuggestions="searchSuggestions"
    />
</template>

<script>
import SearchSuggestions from "@/components/SearchSuggestions";
import Constants from "@/Constants.js";

export default {
    components: {
        SearchSuggestions
    },
    data() {
        return {
            searchText: "",
            searchSuggestions: [],
            suggestionsVisible: false
        };
    },
    methods: {
        async onChange(e) {
            if (e.key === "Enter") {
                this.$router.push({
                    name: "SearchResults",
                    query: { search_query: this.searchText }
                });
                return;
            }

            this.searchSuggestions = await this.fetchJson(
                Constants.BASE_URL +
                    "/suggestions?query=" +
                    encodeURI(this.searchText + e.key)
            );
        },
        onInputFocus() {
            this.suggestionsVisible = true;
        },
        onInputBlur() {
            this.suggestionsVisible = false;
        }
    }
};
</script>

<style></style>
