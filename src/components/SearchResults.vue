<template>
    <h1 class="uk-text-center">
        {{ $route.query.search_query }}
    </h1>

    <div v-if="results" class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            style="background: #0b0e0f"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="result.url"
            v-for="result in results"
        >
            <div class="uk-text-secondary" style="background: #0b0e0f">
                <router-link
                    class="uk-text-emphasis"
                    v-bind:to="result.url || '/'"
                >
                    <img style="width: 100%" v-bind:src="result.thumbnail" />
                    <p>{{ result.name }}</p>
                </router-link>
                <router-link
                    class="uk-link-muted"
                    v-bind:to="result.uploaderUrl || '/'"
                >
                    <p>{{ result.uploaderName }}</p>
                </router-link>
                {{ result.duration ? timeFormat(result.duration) : "" }}
                <b v-if="result.views" class="uk-text-small uk-align-right">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    {{ result.views }} views
                </b>
            </div>
        </div>
    </div>
</template>

<script>
import Constants from "@/Constants.js";

export default {
    data() {
        return {
            results: null
        };
    },
    mounted() {
        this.updateResults();
    },
    watch: {
        "$route.query.search_query": function() {
            this.updateResults();
        }
    },
    methods: {
        async fetchResults() {
            return await (
                await fetch(
                    Constants.BASE_URL +
                        "/search?q=" +
                        encodeURIComponent(this.$route.query.search_query)
                )
            ).json();
        },
        async updateResults() {
            this.results = this.fetchResults().then(
                json => (this.results = json)
            );
        }
    }
};
</script>
