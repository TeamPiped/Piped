<template>
    <div class="uk-position-absolute uk-panel uk-box-shadow-large suggestions-container">
        <ul class="uk-list uk-margin-remove uk-text-secondary">
            <li
                v-for="(suggestion, i) in searchSuggestions"
                :key="i"
                :class="{ selected: selected === i }"
                class="uk-margin-remove suggestion"
            >
                {{ suggestion }}
            </li>
        </ul>
    </div>
</template>

<script>
import Constants from "@/Constants.js";

export default {
    props: {
        searchText: String
    },
    data() {
        return {
            selected: 0,
            searchSuggestions: []
        };
    },
    methods: {
        onKeyUp(e) {
            if (e.key === "ArrowUp") {
                if (this.selected <= 0) {
                    this.selected = this.searchSuggestions.length - 1;
                } else {
                    this.selected -= 1;
                }
                e.preventDefault();
            } else if (e.key === "ArrowDown") {
                if (this.selected >= this.searchSuggestions.length - 1) {
                    this.selected = 0;
                } else {
                    this.selected += 1;
                }
                e.preventDefault();
            } else {
                this.refreshSuggestions();
            }
        },
        async refreshSuggestions() {
            this.searchSuggestions = await this.fetchJson(
                Constants.BASE_URL + "/suggestions?query=" + encodeURI(this.searchText)
            );
            this.searchSuggestions.unshift(this.searchText);
        }
    },
    watch: {
        selected(newValue, oldValue) {
            if (newValue !== oldValue && this.searchSuggestions[this.selected]) {
                this.$emit("searchchange", this.searchSuggestions[this.selected]);
            }
        }
    },
    mounted() {
        window.addEventListener("keyup", this.onKeyUp);
    },
    beforeUnmount() {
        window.removeEventListener("keyup", this.onKeyUp);
    }
};
</script>

<style>
.suggestions-container {
    background-color: #242727;
    left: 50%;
    transform: translateX(-50%);
    max-width: 640px;
    width: 100%;
    box-sizing: border-box;
    padding: 5px 0;
}
.suggestion {
    padding: 4px 15px;
}
.suggestion.selected {
    background-color: #393d3d;
}
@media screen and (max-width: 959px) {
    .suggestions-container {
        max-width: calc(100% - 60px);
    }
}
@media screen and (max-width: 639px) {
    .suggestions-container {
        max-width: calc(100% - 30px);
    }
}
</style>
