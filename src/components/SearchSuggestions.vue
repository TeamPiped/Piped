<template>
    <div class="absolute suggestions-container">
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
            } else {
                this.searchSuggestions = (
                    await this.fetchJson(this.apiUrl() + "/opensearch/suggestions", {
                        query: this.searchText,
                    })
                )?.[1];
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
    @apply left-1/2 translate-x-[-50%] transform-gpu max-w-3xl w-full box-border p-y-1.25 z-10 lt-md:max-w-[calc(100%-0.5rem)] bg-gray-300;
}

.dark .suggestions-container {
    @apply bg-dark-400;
}

.suggestion-selected {
    @apply bg-gray-200;
}

.dark .suggestion-selected {
    @apply bg-dark-100;
}

.suggestion {
    @apply p-y-1;
}
</style>
