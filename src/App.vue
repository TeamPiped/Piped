<template>
    <div
        class="uk-container uk-container-expand uk-light uk-height-viewport"
        style="background: #0b0e0f"
    >
        <nav
            class="uk-navbar-container uk-container-expand uk-light"
            style="background: #0b0e0f"
            uk-navbar
        >
            <div class="uk-navbar-left">
                <router-link class="uk-navbar-item uk-logo uk-text-bold" to="/"
                    ><img
                        src="../public/img/icons/logo.svg"
                        height="32"
                        width="32"
                    />iped</router-link
                >
            </div>
            <div class="uk-navbar-center uk-flex">
                <input
                    class="uk-input"
                    type="text"
                    placeholder="Search"
                    v-model="searchText"
                    @keypress="onChange($event)"
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

        <router-view />
    </div>
</template>

<script>
import Constants from "@/Constants.js";
export default {
    data() {
        return {
            searchText: "",
            searchSuggestions: []
        };
    },
    methods: {
        onChange(e) {
            if (e.key === "Enter") {
                this.$router.push({
                    name: "SearchResults",
                    query: { search_query: this.searchText }
                });
                return;
            }

            this.fetchJson(
                Constants.BASE_URL +
                    "/suggestions?query=" +
                    encodeURI(this.searchText + e.key)
            );
        }
    }
};
</script>

<style>
#app {
    background: #0b0e0f;
}

::-webkit-scrollbar {
    background-color: #15191a;
    color: #c5bcae;
}

::-webkit-scrollbar-thumb {
    background-color: #4b4f52;
}

::-webkit-scrollbar-thumb:hover {
    background-color: #5b6469;
}

::-webkit-scrollbar-thumb:active {
    background-color: #485053;
}

::-webkit-scrollbar-corner {
    background-color: #0b0e0f;
}

* {
    scrollbar-color: #15191a #444a4e;
}
</style>
