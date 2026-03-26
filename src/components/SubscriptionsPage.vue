<template>
    <h1 v-t="'titles.subscriptions'" class="my-4 text-center font-bold" />
    <!-- import / export section -->
    <div class="flex flex-wrap justify-between">
        <div class="flex gap-1">
            <!-- import json/csv -->
            <button class="btn">
                <router-link v-t="'actions.import_from_json_csv'" to="/import" />
            </button>
            <!-- export to json -->
            <button v-t="'actions.export_to_json'" class="btn" @click="exportHandler" />
        </div>
        <div class="m-1 flex flex-wrap gap-1">
            <!-- import channel groups to json-->
            <div>
                <label
                    for="fileSelector"
                    class="btn"
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
                class="btn"
                @click="exportGroupsHandler"
                v-text="`${$t('actions.export_to_json')} (${$t('titles.channel_groups')})`"
            />
        </div>
        <!-- subscriptions count, only shown if there are any  -->
        <div v-if="subscriptions.length > 0" class="flex self-center gap-1">
            <i18n-t keypath="subscriptions.subscribed_channels_count">{{ subscriptions.length }}</i18n-t>
        </div>
    </div>
    <br />
    <hr />
    <div class="w-full flex flex-wrap">
        <button
            v-for="group in channelGroups"
            :key="group.groupName"
            class="btn mx-1 w-max"
            :class="{ selected: selectedGroup === group }"
            @click="selectGroup(group)"
        >
            <span v-text="group.groupName !== '' ? group.groupName : $t('video.all')" />
            <div v-if="group.groupName != '' && selectedGroup == group">
                <i class="i-fa6-solid:pen mx-2" @click="showEditGroupModal = true" />
                <i class="i-fa6-solid:circle-minus mx-2" @click="groupToDelete = group.groupName" />
            </div>
        </button>
        <ConfirmModal
            v-if="groupToDelete != null"
            :message="$t('actions.delete_group_confirm')"
            @close="groupToDelete = null"
            @confirm="deleteGroup(groupToDelete)"
        />
        <button class="btn mx-1" @click="showCreateGroupModal = true">
            <i class="i-fa6-solid:circle-plus" />
        </button>
    </div>
    <br />
    <hr />
    <!-- Subscriptions card list -->
    <div class="xl:grid xl:grid-cols-5 <md:flex-wrap">
        <!-- channel info card -->
        <div
            v-for="subscription in filteredSubscriptions"
            :key="subscription.url"
            class="col m-2 border border-gray-500 rounded-lg p-1"
        >
            <router-link :to="subscription.url" class="text-4x4 flex p-2 font-bold">
                <img :src="subscription.avatar" class="h-[fit-content] rounded-full" width="48" height="48" />
                <span class="mx-2 self-center" v-text="subscription.name" />
            </router-link>
            <!-- subscribe / unsubscribe btn -->
            <button
                v-t="`actions.${subscription.subscribed ? 'unsubscribe' : 'subscribe'}`"
                class="btn mt-2 w-full"
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
        <div class="mb-5 mt-3 flex justify-between">
            <input v-model="editedGroupName" type="text" class="input" />
            <button v-t="'actions.okay'" class="btn" :placeholder="$t('actions.group_name')" @click="editGroupName()" />
        </div>
        <div class="mb-2 mt-3 h-[80vh] flex flex-col overflow-y-scroll pr-2">
            <div v-for="subscription in subscriptions" :key="subscription.name">
                <div class="mr-3 flex items-center justify-between">
                    <a :href="subscription.url" target="_blank" class="flex items-center overflow-hidden">
                        <img :src="subscription.avatar" class="h-8 w-8 rounded-full" />
                        <span class="ml-2">{{ subscription.name }}</span>
                    </a>
                    <input
                        type="checkbox"
                        class="checkbox"
                        :checked="selectedGroup.channels.includes(subscription.url.substr(-24))"
                        @change="checkedChange(subscription)"
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

<style>
.selected {
    border: 0.1rem outset red;
}
</style>
