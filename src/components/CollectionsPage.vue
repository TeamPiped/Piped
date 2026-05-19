<template>
    <div>
        <div class="mb-4 flex items-center justify-between">
            <h1 class="flex items-center gap-2 text-2xl font-bold">
                <i-fa6-solid-layer-group class="text-red-500" />
                {{ $t("titles.collections") }}
            </h1>
            <button
                class="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
                @click="showCreateModal = true"
            >
                <i-fa6-solid-plus />
                {{ $t("actions.create_collection") }}
            </button>
        </div>

        <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {{ $t("info.collections_hint") }}
        </p>

        <div v-if="collections.length === 0" class="flex flex-col items-center gap-3 py-20 text-gray-500">
            <i-fa6-solid-layer-group class="size-12" />
            <p class="text-lg">{{ $t("info.collections_empty") }}</p>
        </div>

        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div
                v-for="col in collections"
                :key="col.name"
                class="group relative cursor-pointer rounded-xl bg-gray-100 p-4 transition-shadow hover:shadow-md dark:bg-dark-800"
                @click="openCollection(col)"
            >
                <!-- channel avatars grid -->
                <div class="mb-3 flex flex-wrap gap-1">
                    <img
                        v-for="ch in col.channels.slice(0, 6)"
                        :key="ch.url"
                        :src="ch.avatar"
                        :alt="ch.name"
                        class="size-10 rounded-full object-cover"
                        loading="lazy"
                    />
                    <div
                        v-if="col.channels.length > 6"
                        class="flex size-10 items-center justify-center rounded-full bg-gray-300 text-xs font-bold dark:bg-dark-400"
                    >
                        +{{ col.channels.length - 6 }}
                    </div>
                </div>
                <h3 class="font-semibold" v-text="col.name" />
                <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {{ col.channels.length }} {{ $t("info.channels_count") }}
                </p>
                <button
                    class="absolute top-3 right-3 rounded-full p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-red-500 dark:hover:bg-dark-400"
                    @click.stop="deleteCollection(col.name)"
                >
                    <i-fa6-solid-trash class="size-3.5" />
                </button>
            </div>
        </div>

        <!-- Collection detail view -->
        <div v-if="activeCollection" class="mt-8">
            <div class="mb-4 flex items-center gap-3">
                <button
                    class="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-dark-400"
                    @click="activeCollection = null"
                >
                    <i-fa6-solid-chevron-left />
                </button>
                <h2 class="text-xl font-bold" v-text="activeCollection.name" />
                <button
                    class="ml-auto rounded-lg bg-gray-200 px-3 py-1.5 text-sm dark:bg-dark-400"
                    @click="showAddChannelModal = true"
                >
                    <i-fa6-solid-plus class="mr-1" />
                    {{ $t("actions.add_channel") }}
                </button>
            </div>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div
                    v-for="ch in activeCollection.channels"
                    :key="ch.url"
                    class="flex items-center gap-3 rounded-xl bg-gray-100 p-3 dark:bg-dark-800"
                >
                    <img :src="ch.avatar" :alt="ch.name" class="size-12 rounded-full" loading="lazy" />
                    <div class="min-w-0 flex-1">
                        <router-link :to="ch.url" class="block truncate font-medium hover:text-red-500">{{
                            ch.name
                        }}</router-link>
                        <p v-if="ch.subscriberCount" class="text-xs text-gray-500">
                            {{ formatCount(ch.subscriberCount) }} subscribers
                        </p>
                    </div>
                    <button
                        class="shrink-0 rounded-full p-1.5 text-gray-400 hover:text-red-500"
                        @click="removeChannelFromCollection(activeCollection.name, ch.url)"
                    >
                        <i-fa6-solid-xmark />
                    </button>
                </div>
            </div>
        </div>

        <!-- Create modal -->
        <div
            v-if="showCreateModal"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            @click.self="showCreateModal = false"
        >
            <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-dark-700">
                <h3 class="mb-4 text-lg font-bold">{{ $t("actions.create_collection") }}</h3>
                <input
                    v-model="newCollectionName"
                    type="text"
                    :placeholder="$t('info.collection_name_placeholder')"
                    class="mb-4 w-full rounded-lg bg-gray-100 px-4 py-2.5 focus:ring-2 focus:ring-red-400 focus:outline-none dark:bg-dark-400"
                    @keyup.enter="createCollection"
                />
                <div class="flex justify-end gap-2">
                    <button
                        class="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-400"
                        @click="showCreateModal = false"
                    >
                        {{ $t("actions.cancel") }}
                    </button>
                    <button
                        :disabled="!newCollectionName.trim()"
                        class="rounded-lg bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600 disabled:opacity-50"
                        @click="createCollection"
                    >
                        {{ $t("actions.create_collection") }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const collections = ref([]);
const activeCollection = ref(null);
const showCreateModal = ref(false);
const showAddChannelModal = ref(false);
const newCollectionName = ref("");

const STORAGE_KEY = "pipedCollections";

function loadCollections() {
    try {
        collections.value = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
    } catch {
        collections.value = [];
    }
}

function saveCollections() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(collections.value));
    } catch {
        // localStorage unavailable
    }
}

function createCollection() {
    const name = newCollectionName.value.trim();
    if (!name) return;
    if (collections.value.find(c => c.name === name)) return;
    collections.value = [...collections.value, { name, channels: [] }];
    saveCollections();
    newCollectionName.value = "";
    showCreateModal.value = false;
}

function deleteCollection(name) {
    collections.value = collections.value.filter(c => c.name !== name);
    if (activeCollection.value?.name === name) activeCollection.value = null;
    saveCollections();
}

function openCollection(col) {
    activeCollection.value = col;
}

function removeChannelFromCollection(colName, channelUrl) {
    const col = collections.value.find(c => c.name === colName);
    if (!col) return;
    col.channels = col.channels.filter(ch => ch.url !== channelUrl);
    saveCollections();
    if (activeCollection.value?.name === colName) activeCollection.value = { ...col };
}

function formatCount(n) {
    if (!n || n < 0) return "";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return String(n);
}

onMounted(loadCollections);
onActivated(() => {
    document.title = t("titles.collections") + " - Piped";
    loadCollections();
});
</script>
