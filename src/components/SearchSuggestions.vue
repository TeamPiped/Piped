<template>
    <div class="suggestions-container absolute">
        <ul>
            <li
                v-for="(suggestion, i) in searchSuggestions"
                :key="i"
                @mouseover="onMouseOver(i)"
                @click="setSelected(i)"
            >
                <router-link
                    class="suggestion"
                    :class="{ 'suggestion-selected': selected === i }"
                    :to="`/results?search_query=${encodeURIComponent(suggestion)}`"
                    >{{ suggestion }}</router-link
                >
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { fetchJson, apiUrl } from "@/composables/useApi.js";
import { getPreferenceBoolean } from "@/composables/usePreferences.js";

const props = defineProps({
    searchText: { type: String, default: "" },
});

const emit = defineEmits(["searchchange"]);

const selected = ref(0);
const searchSuggestions = ref([]);

function onKeyUp(e) {
    if (e.key === "ArrowUp") {
        if (selected.value <= 0) {
            setSelected(searchSuggestions.value.length - 1);
        } else {
            setSelected(selected.value - 1);
        }
        e.preventDefault();
    } else if (e.key === "ArrowDown") {
        if (selected.value >= searchSuggestions.value.length - 1) {
            setSelected(0);
        } else {
            setSelected(selected.value + 1);
        }
        e.preventDefault();
    } else {
        refreshSuggestions();
    }
}

async function refreshSuggestions() {
    if (!props.searchText) {
        if (getPreferenceBoolean("searchHistory", false))
            searchSuggestions.value = JSON.parse(localStorage.getItem("search_history")) ?? [];
    } else if (getPreferenceBoolean("searchSuggestions", true)) {
        searchSuggestions.value =
            (
                await fetchJson(apiUrl() + "/opensearch/suggestions", {
                    query: props.searchText,
                })
            )?.[1] ?? [];
    } else {
        searchSuggestions.value = [];
        return;
    }
    searchSuggestions.value.unshift(props.searchText);
    setSelected(0);
}

function onMouseOver(i) {
    if (i !== selected.value) {
        selected.value = i;
    }
}

function setSelected(val) {
    selected.value = val;
    emit("searchchange", searchSuggestions.value[selected.value]);
}

defineExpose({ onKeyUp, refreshSuggestions });
</script>

<style>
.suggestions-container {
    @apply left-1/2 translate-x-[-50%] transform-gpu max-w-3xl w-full box-border z-10 lt-md:max-w-[calc(100%-0.5rem)] bg-gray-300;
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
    @apply block w-full p-1;
}
</style>
