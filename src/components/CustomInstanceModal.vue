<template>
    <ModalComponent @close="$emit('close')">
        <h3 v-t="'titles.custom_instances'" class="my-4 font-bold" />
        <hr />
        <div class="text-center">
            <div>
                <div v-for="(customInstance, index) in customInstances" :key="customInstance.name">
                    <div class="flex items-center justify-between">
                        <span>{{ customInstance.name }} - {{ customInstance.api_url }}</span>
                        <i-fa6-solid-circle-minus
                            class="cursor-pointer"
                            @click="removeInstance(customInstance, index)"
                        />
                    </div>
                    <hr />
                </div>
            </div>
            <form class="flex flex-col items-end gap-2">
                <input
                    v-model="name"
                    class="h-8 w-full rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                    type="text"
                    :placeholder="$t('preferences.instance_name')"
                />
                <input
                    v-model="url"
                    class="h-8 w-full rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                    type="text"
                    :placeholder="$t('preferences.api_url')"
                    @keyup.enter="addInstance"
                />
                <button
                    v-t="'actions.add'"
                    class="inline-block w-min cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click.prevent="addInstance"
                />
            </form>
        </div>
    </ModalComponent>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import ModalComponent from "./ModalComponent.vue";
import { getCustomInstances, addCustomInstance, removeCustomInstance } from "@/composables/useCustomInstances.js";

const { t } = useI18n();

defineEmits(["close"]);

const customInstances = ref([]);
const name = ref("");
const url = ref("");

onMounted(() => {
    customInstances.value = getCustomInstances();
});

function isValidInstanceUrl(str) {
    var a = document.createElement("a");
    a.href = str;
    return a.host && a.host != window.location.host;
}

async function addInstance() {
    const newInstance = {
        name: name.value,
        api_url: url.value,
    };

    if (!newInstance.name || !newInstance.api_url) {
        return;
    }
    if (!isValidInstanceUrl(newInstance.api_url)) {
        alert(t("actions.invalid_url"));
        return;
    }

    addCustomInstance(newInstance);
    name.value = "";
    url.value = "";
}

function removeInstance(instance, index) {
    customInstances.value.splice(index, 1);
    removeCustomInstance(instance);
}
</script>
