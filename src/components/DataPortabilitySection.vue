<template>
    <div class="rounded-lg border border-gray-200 p-4 dark:border-dark-700">
        <h3 class="mb-2 font-semibold">{{ $t("preferences.backup_restore") }}</h3>
        <p class="mb-3 text-sm text-gray-500">{{ $t("info.backup_hint") }}</p>
        <div class="flex flex-wrap gap-2">
            <button
                class="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                @click="onExport"
            >
                <i-fa6-solid-download class="mr-1.5 inline" />
                {{ $t("actions.export_all") }}
            </button>
            <label
                class="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
            >
                <i-fa6-solid-upload class="mr-1.5 inline" />
                {{ $t("actions.import_all") }}
                <input type="file" accept="application/json" class="sr-only" @change="onImport" />
            </label>
        </div>
        <p v-if="status" class="mt-3 text-sm text-green-600 dark:text-green-400" v-text="status" />
    </div>
</template>

<script setup>
import { ref } from "vue";
import { exportAll, importAll } from "@/composables/useDataPortability.js";

const status = ref(null);

async function onExport() {
    await exportAll();
    status.value = "Exported.";
    setTimeout(() => (status.value = null), 3000);
}

async function onImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        const result = await importAll(file);
        status.value = `Imported ${result.restoredKeys} entries. Reload to apply.`;
    } catch (err) {
        status.value = `Import failed: ${err.message}`;
    }
}
</script>
