<template>
    <div class="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-gray-100 p-3 dark:bg-dark-800">
        <span class="text-sm font-medium">{{ $t("titles.filters") }}:</span>

        <select
            v-model="local.uploadDate"
            class="rounded-md bg-white px-2 py-1 text-sm dark:bg-dark-700"
            @change="emit"
        >
            <option value="">{{ $t("filters.any_time") }}</option>
            <option value="hour">{{ $t("filters.last_hour") }}</option>
            <option value="day">{{ $t("filters.today") }}</option>
            <option value="week">{{ $t("filters.this_week") }}</option>
            <option value="month">{{ $t("filters.this_month") }}</option>
            <option value="year">{{ $t("filters.this_year") }}</option>
        </select>

        <select v-model="local.duration" class="rounded-md bg-white px-2 py-1 text-sm dark:bg-dark-700" @change="emit">
            <option value="">{{ $t("filters.any_duration") }}</option>
            <option value="short">{{ $t("filters.short") }} (&lt; 4m)</option>
            <option value="medium">{{ $t("filters.medium") }} (4-20m)</option>
            <option value="long">{{ $t("filters.long") }} (&gt; 20m)</option>
        </select>

        <select v-model="local.sortBy" class="rounded-md bg-white px-2 py-1 text-sm dark:bg-dark-700" @change="emit">
            <option value="relevance">{{ $t("filters.relevance") }}</option>
            <option value="date">{{ $t("filters.upload_date") }}</option>
            <option value="views">{{ $t("filters.view_count") }}</option>
            <option value="rating">{{ $t("filters.rating") }}</option>
        </select>

        <button
            v-if="hasFilters"
            class="ml-auto text-sm text-gray-500 underline hover:text-gray-900 dark:hover:text-white"
            @click="reset"
        >
            {{ $t("actions.reset") }}
        </button>
    </div>
</template>

<script setup>
import { reactive, computed } from "vue";

const props = defineProps({
    modelValue: { type: Object, default: () => ({ uploadDate: "", duration: "", sortBy: "relevance" }) },
});
const emitFn = defineEmits(["update:modelValue"]);

const local = reactive({ ...props.modelValue });

function emit() {
    emitFn("update:modelValue", { ...local });
}

const hasFilters = computed(() => local.uploadDate || local.duration || local.sortBy !== "relevance");

function reset() {
    local.uploadDate = "";
    local.duration = "";
    local.sortBy = "relevance";
    emit();
}
</script>
