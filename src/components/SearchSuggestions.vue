<template>
    <div class="suggestions-container absolute">
        <ul>
            <li
                v-for="(suggestion, i) in searchSuggestions"
                :key="i"
                class="suggestion"
                :class="{ 'suggestion-selected': selected === i }"
                @mouseover="onMouseOver(i)"
                @mousedown.stop="onClick(i)"
                v-text="suggestion"
            />
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        searchText: { type: String, default: "" },
    },
    emits: ["searchchange"],
    data() {
        return {
            selected: 0,
            searchSuggestions: [],
        };
    },
    methods: {
        onKeyUp(e) {
            if (e.key === "ArrowUp") {
                if (this.selected <= 0) {
                    this.setSelected(this.searchSuggestions.length - 1);
                } else {
                    this.setSelected(this.selected - 1);
                }
                e.preventDefault();
            } else if (e.key === "ArrowDown") {
                if (this.selected >= this.searchSuggestions.length - 1) {
                    this.setSelected(0);
                } else {
                    this.setSelected(this.selected + 1);
                }
                e.preventDefault();
            } else {
                this.refreshSuggestions();
            }
        },
        async refreshSuggestions() {
            if (!this.searchText) {
                if (this.getPreferenceBoolean("searchHistory", false))
                    this.searchSuggestions = JSON.parse(localStorage.getItem("search_history")) ?? [];
            } else if (this.getPreferenceBoolean("searchSuggestions", true)) {
                this.searchSuggestions =
                    (
                        await this.fetchJson(this.apiUrl() + "/opensearch/suggestions", {
                            query: this.searchText,
                        })
                    )?.[1] ?? [];
            } else {
                this.searchSuggestions = [];
                return;
            }
            this.searchSuggestions.unshift(this.searchText);
            this.setSelected(0);
        },
        onMouseOver(i) {
            if (i !== this.selected) {
                this.selected = i;
            }
        },
        onClick(i) {
            this.setSelected(i);
            this.$router.push({
                name: "SearchResults",
                query: { search_query: this.searchSuggestions[i] },
            });
        },
        setSelected(val) {
            this.selected = val;
            this.$emit("searchchange", this.searchSuggestions[this.selected]);
        },
    },
};
</script>

<style>
.suggestions-container {
    @apply left-1/2 translate-x-[-50%] transform-gpu max-w-[600rem] w-full box-border z-10 lt-md:max-w-[calc(100%-0.5rem)];
    background: var(--efy_text2);
    box-shadow: 0 0 20rem var(--efy_text_trans);
    padding: var(--efy_gap);
    margin: calc(-12rem + var(--efy_gap)) 0 var(--efy_gap) 0;
}
</style>
