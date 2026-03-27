<template>
    <h1 v-t="'titles.subscriptions'" class="my-4 text-center font-bold" />
    <!-- import / export section -->
    <div class="flex flex-wrap justify-between">
        <div class="flex gap-1">
            <!-- import json/csv -->
            <button
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            >
                <router-link v-t="'actions.import_from_json_csv'" to="/import" />
            </button>
            <!-- export to json -->
            <button
                v-t="'actions.export_to_json'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="exportHandler"
            />
        </div>
        <div class="m-1 flex flex-wrap gap-1">
            <!-- import channel groups to json-->
            <div>
                <label
                    for="fileSelector"
                    class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    v-text="`${$t('actions.import_from_json')} (${$t('titles.channel_groups')})`"
                />
                <input
                    id="fileSelector"
                    ref="fileSelector"
                    type="file"
                    class="hidden"
                    multiple="multiple"
                    @change="importGroupsHandler"
                />
            </div>

            <!-- export channel groups to json  -->
            <button
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="exportGroupsHandler"
                v-text="`${$t('actions.export_to_json')} (${$t('titles.channel_groups')})`"
            />
        </div>
        <!-- subscriptions count, only shown if there are any  -->
        <div v-if="subscriptions.length > 0" class="flex gap-1 self-center">
            <i18n-t keypath="subscriptions.subscribed_channels_count">{{ subscriptions.length }}</i18n-t>
        </div>
    </div>
    <br />
    <hr />
    <div class="flex w-full flex-wrap">
        <button
            v-for="group in channelGroups"
            :key="group.groupName"
            class="mx-1 inline-block w-max cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            :class="{ 'border-2 border-red-500': selectedGroup === group }"
            @click="selectGroup(group)"
        >
            <span v-text="group.groupName !== '' ? group.groupName : $t('video.all')" />
            <div v-if="group.groupName != '' && selectedGroup == group">
                <i-fa6-solid-pen class="mx-2" @click="showEditGroupModal = true" />
                <i-fa6-solid-circle-minus class="mx-2" @click="groupToDelete = group.groupName" />
            </div>
        </button>
        <ConfirmModal
            v-if="groupToDelete != null"
            :message="$t('actions.delete_group_confirm')"
            @close="groupToDelete = null"
            @confirm="deleteGroup(groupToDelete)"
        />
        <button
            class="mx-1 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            @click="showCreateGroupModal = true"
        >
            <i-fa6-solid-circle-plus />
        </button>
    </div>
    <br />
    <hr />
    <!-- Subscriptions card list -->
    <div class="max-md:flex-wrap xl:grid xl:grid-cols-5">
        <!-- channel info card -->
        <div
            v-for="subscription in filteredSubscriptions"
            :key="subscription.url"
            class="m-2 rounded-lg border border-gray-500 p-1"
        >
            <router-link :to="subscription.url" class="flex p-2 text-4xl font-bold">
                <img :src="subscription.avatar" class="h-fit rounded-full" width="48" height="48" />
                <span class="mx-2 self-center" v-text="subscription.name" />
            </router-link>
            <!-- subscribe / unsubscribe btn -->
            <button
                v-t="`actions.${subscription.subscribed ? 'unsubscribe' : 'subscribe'}`"
                class="mt-2 inline-block w-full cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="handleButton(subscription)"
            />
        </div>
    </div>
    <br />

    <CreateGroupModal
        v-if="showCreateGroupModal"
        :on-create-group="createGroup"
        @close="showCreateGroupModal = false"
    />

    <ModalComponent v-if="showEditGroupModal" @close="showEditGroupModal = false">
        <div class="mt-3 mb-5 flex justify-between">
            <input
                v-model="editedGroupName"
                type="text"
                class="h-8 rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
            />
            <button
                v-t="'actions.okay'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                :placeholder="$t('actions.group_name')"
                @click="editGroupName()"
            />
        </div>
        <div class="mt-3 mb-2 flex h-[80vh] flex-col overflow-y-scroll pr-2">
            <div v-for="subscription in subscriptions" :key="subscription.name">
                <div class="mr-3 flex items-center justify-between">
                    <a :href="subscription.url" target="_blank" class="flex items-center overflow-hidden">
                        <img :src="subscription.avatar" class="size-8 rounded-full" />
                        <span class="ml-2">{{ subscription.name }}</span>
                    </a>
                    <UiCheckbox
                        :model-value="selectedGroup.channels.includes(subscription.url.substr(-24))"
                        @update:model-value="checkedChange(subscription)"
                    />
                </div>
                <hr />
            </div>
        </div>
    </ModalComponent>
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from "vue";
import ModalComponent from "./ModalComponent.vue";
import CreateGroupModal from "./CreateGroupModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import UiCheckbox from "./ui/Checkbox.vue";
import { fetchJson, authApiUrl, getAuthToken, isAuthenticated } from "@/composables/useApi.js";
import { fetchSubscriptions, handleLocalSubscriptions } from "@/composables/useSubscriptions.js";
import { getChannelGroups, createOrUpdateChannelGroup, deleteChannelGroup } from "@/composables/useChannelGroups.js";
import { download } from "@/composables/useMisc.js";

const fileSelector = ref(null);
const subscriptions = ref([]);
const selectedGroup = ref({
    groupName: "",
    channels: [],
});
const channelGroups = ref([]);
const showCreateGroupModal = ref(false);
const showEditGroupModal = ref(false);
const editedGroupName = ref("");
const groupToDelete = ref(null);

const filteredSubscriptions = computed(() => {
    return selectedGroup.value.groupName == ""
        ? subscriptions.value
        : subscriptions.value.filter(channel => selectedGroup.value.channels.includes(channel.url.substr(-24)));
});

function handleButton(subscription) {
    const channelId = subscription.url.split("/")[2];
    if (isAuthenticated()) {
        fetchJson(authApiUrl() + (subscription.subscribed ? "/unsubscribe" : "/subscribe"), null, {
            method: "POST",
            body: JSON.stringify({
                channelId: channelId,
            }),
            headers: {
                Authorization: getAuthToken(),
                "Content-Type": "application/json",
            },
        });
    } else {
        handleLocalSubscriptions(channelId);
    }
    subscription.subscribed = !subscription.subscribed;
}

function exportHandler() {
    const subs = [];
    subscriptions.value.forEach(subscription => {
        subs.push({
            url: "https://www.youtube.com" + subscription.url,
            name: subscription.name,
            service_id: 0,
        });
    });
    const json = JSON.stringify({
        app_version: "",
        app_version_int: 0,
        subscriptions: subs,
    });
    download(json, "subscriptions.json", "application/json");
}

function selectGroup(group) {
    selectedGroup.value = group;
    editedGroupName.value = group.groupName;
}

function createGroup(newGroupName) {
    if (!newGroupName || channelGroups.value.some(group => group.groupName == newGroupName)) return;

    const newGroup = {
        groupName: newGroupName,
        channels: [],
    };
    channelGroups.value.push(newGroup);
    createOrUpdateChannelGroup(newGroup);

    showCreateGroupModal.value = false;
}

function editGroupName() {
    const oldGroupName = selectedGroup.value.groupName;
    const newGroupName = editedGroupName.value;

    if (!newGroupName || newGroupName == oldGroupName) return;
    if (channelGroups.value.some(group => group.groupName == newGroupName)) return;

    selectedGroup.value.groupName = newGroupName;
    createOrUpdateChannelGroup(selectedGroup.value);
    deleteChannelGroup(oldGroupName);

    showEditGroupModal.value = false;
}

function deleteGroup(group) {
    deleteChannelGroup(group);
    channelGroups.value = channelGroups.value.filter(g => g.groupName != group);
    selectedGroup.value = channelGroups.value[0] || {};
    groupToDelete.value = null;
}

function checkedChange(subscription) {
    const channelId = subscription.url.substr(-24);
    selectedGroup.value.channels = selectedGroup.value.channels.includes(channelId)
        ? selectedGroup.value.channels.filter(channel => channel != channelId)
        : selectedGroup.value.channels.concat(channelId);
    createOrUpdateChannelGroup(selectedGroup.value);
}

async function importGroupsHandler() {
    const files = fileSelector.value.files;
    for (let file of files) {
        const groups = JSON.parse(await file.text()).groups;
        for (let group of groups) {
            createOrUpdateChannelGroup(group);
            channelGroups.value.push(group);
        }
    }
}

function exportGroupsHandler() {
    const json = {
        format: "Piped",
        version: 1,
        groups: channelGroups.value.slice(1),
    };
    download(JSON.stringify(json), "channel_groups.json", "application/json");
}

onMounted(() => {
    fetchSubscriptions().then(json => {
        if (json.error) {
            alert(json.error);
            return;
        }

        subscriptions.value = json;
        subscriptions.value.forEach(subscription => (subscription.subscribed = true));
    });

    channelGroups.value.push(selectedGroup.value);
    if (!window.db) return;

    (async () => {
        const groups = await getChannelGroups();
        channelGroups.value.push(...groups);
    })();
});

onActivated(() => {
    document.title = "Subscriptions - Piped";
});
</script>
