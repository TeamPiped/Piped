<template>
    <ModalComponent>
        <div class="text-center">
            <h2 v-t="'actions.import_history'" class="mb-4 text-center text-xl font-bold" />
            <form>
                <br />
                <div>
                    <input
                        ref="fileSelector"
                        class="mb-2 ml-2 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                        type="file"
                        @change="fileChange"
                    />
                </div>
                <div>
                    <strong
                        ><i18n-t keypath="info.found_n_items">{{ itemsLength }}</i18n-t></strong
                    >
                </div>
                <div>
                    <strong class="flex items-center justify-center gap-2">
                        <span v-t="'actions.override'" />: <UiCheckbox v-model="override" />
                    </strong>
                </div>
                <br />
                <div>
                    <ProgressRoot
                        :model-value="itemsLength ? index : 0"
                        :max="itemsLength || 1"
                        class="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-300 dark:bg-dark-400"
                    >
                        <ProgressIndicator
                            class="h-full rounded-full bg-red-500 transition-transform duration-200 ease-out"
                            :style="{ transform: `translateX(-${100 - progressPercent}%)` }"
                        />
                    </ProgressRoot>
                    <div
                        v-text="
                            `${$t('info.success')}: ${success} ${$t('info.error')}: ${error} ${$t(
                                'info.skipped',
                            )}: ${skipped}`
                        "
                    />
                </div>
                <br />
                <div>
                    <a
                        class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                        @click="handleImport"
                        v-text="$t('actions.import')"
                    />
                </div>
            </form>
        </div>
    </ModalComponent>
</template>
<script setup>
import { ref, computed } from "vue";
import { ProgressIndicator, ProgressRoot } from "reka-ui";
import ModalComponent from "./ModalComponent.vue";
import UiCheckbox from "./ui/Checkbox.vue";

const fileSelector = ref(null);
const items = ref([]);
const override = ref(false);
const index = ref(0);
const success = ref(0);
const error = ref(0);
const skipped = ref(0);

const itemsLength = computed(() => items.value.length);
const progressPercent = computed(() => {
    if (!itemsLength.value) return 0;
    return Math.min((index.value / itemsLength.value) * 100, 100);
});

function fileChange() {
    const file = fileSelector.value.files[0];
    file.text().then(text => {
        items.value = [];
        const json = JSON.parse(text);
        const parsed = json.watchHistory.map(video => {
            return {
                ...video,
                watchedAt: video.watchedAt ?? 0,
                currentTime: video.currentTime ?? 0,
            };
        });
        items.value = parsed.sort((a, b) => b.watchedAt - a.watchedAt);
    });
}

function handleImport() {
    if (window.db) {
        var tx = window.db.transaction("watch_history", "readwrite");
        var store = tx.objectStore("watch_history");
        items.value.forEach(item => {
            const dbItem = store.get(item.videoId);
            dbItem.onsuccess = () => {
                if (dbItem.result && dbItem.result.videoId === item.videoId) {
                    if (!override.value) {
                        index.value++;
                        skipped.value++;
                        return;
                    }
                }
                try {
                    const request = store.put(JSON.parse(JSON.stringify(item))); // prevent "Symbol could not be cloned." error
                    request.onsuccess = () => {
                        index.value++;
                        success.value++;
                    };
                    request.onerror = () => {
                        index.value++;
                        error.value++;
                    };
                } catch (err) {
                    console.error(err);
                    index.value++;
                    error.value++;
                }
            };
        });
    }
}
</script>
