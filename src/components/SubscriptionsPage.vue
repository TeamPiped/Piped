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

<script>
import ModalComponent from "./ModalComponent.vue";
import CreateGroupModal from "./CreateGroupModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

export default {
    components: { ModalComponent, CreateGroupModal, ConfirmModal },
    data() {
        return {
            subscriptions: [],
            selectedGroup: {
                groupName: "",
                channels: [],
            },
            channelGroups: [],
            showCreateGroupModal: false,
            showEditGroupModal: false,
            editedGroupName: "",
            groupToDelete: null,
        };
    },
    computed: {
        filteredSubscriptions(_this) {
            return _this.selectedGroup.groupName == ""
                ? _this.subscriptions
                : _this.subscriptions.filter(channel => _this.selectedGroup.channels.includes(channel.url.substr(-24)));
        },
    },
    mounted() {
        this.fetchSubscriptions().then(json => {
            if (json.error) {
                alert(json.error);
                return;
            }

            this.subscriptions = json;
            this.subscriptions.forEach(subscription => (subscription.subscribed = true));
        });

        this.channelGroups.push(this.selectedGroup);
        if (!window.db) return;

        this.loadChannelGroups();
    },
    activated() {
        document.title = "Subscriptions - Piped";
    },
    methods: {
        async loadChannelGroups() {
            const groups = await this.getChannelGroups();
            this.channelGroups.push(...groups);
        },
        handleButton(subscription) {
            const channelId = subscription.url.split("/")[2];
            if (this.authenticated) {
                this.fetchJson(this.authApiUrl() + (subscription.subscribed ? "/unsubscribe" : "/subscribe"), null, {
                    method: "POST",
                    body: JSON.stringify({
                        channelId: channelId,
                    }),
                    headers: {
                        Authorization: this.getAuthToken(),
                        "Content-Type": "application/json",
                    },
                });
            } else {
                this.handleLocalSubscriptions(channelId);
            }
            subscription.subscribed = !subscription.subscribed;
        },
        exportHandler() {
            const subscriptions = [];
            this.subscriptions.forEach(subscription => {
                subscriptions.push({
                    url: "https://www.youtube.com" + subscription.url,
                    name: subscription.name,
                    service_id: 0,
                });
            });
            const json = JSON.stringify({
                app_version: "",
                app_version_int: 0,
                subscriptions: subscriptions,
            });
            this.download(json, "subscriptions.json", "application/json");
        },
        selectGroup(group) {
            this.selectedGroup = group;
            this.editedGroupName = group.groupName;
        },
        createGroup(newGroupName) {
            if (!newGroupName || this.channelGroups.some(group => group.groupName == newGroupName)) return;

            const newGroup = {
                groupName: newGroupName,
                channels: [],
            };
            this.channelGroups.push(newGroup);
            this.createOrUpdateChannelGroup(newGroup);

            this.showCreateGroupModal = false;
        },
        editGroupName() {
            const oldGroupName = this.selectedGroup.groupName;
            const newGroupName = this.editedGroupName;

            // the group mustn't yet exist and the name can't be empty
            if (!newGroupName || newGroupName == oldGroupName) return;
            if (this.channelGroups.some(group => group.groupName == newGroupName)) return;

            // create a new group with the same info and delete the old one
            this.selectedGroup.groupName = newGroupName;
            this.createOrUpdateChannelGroup(this.selectedGroup);
            this.deleteChannelGroup(oldGroupName);

            this.showEditGroupModal = false;
        },
        deleteGroup(group) {
            this.deleteChannelGroup(group);
            this.channelGroups = this.channelGroups.filter(g => g.groupName != group);
            this.selectedGroup = this.channelGroups[0] || {};
            this.groupToDelete = null;
        },
        checkedChange(subscription) {
            const channelId = subscription.url.substr(-24);
            this.selectedGroup.channels = this.selectedGroup.channels.includes(channelId)
                ? this.selectedGroup.channels.filter(channel => channel != channelId)
                : this.selectedGroup.channels.concat(channelId);
            this.createOrUpdateChannelGroup(this.selectedGroup);
        },
        async importGroupsHandler() {
            const files = this.$refs.fileSelector.files;
            for (let file of files) {
                const groups = JSON.parse(await file.text()).groups;
                for (let group of groups) {
                    this.createOrUpdateChannelGroup(group);
                    this.channelGroups.push(group);
                }
            }
        },
        exportGroupsHandler() {
            const json = {
                format: "Piped",
                version: 1,
                groups: this.channelGroups.slice(1),
            };
            this.download(JSON.stringify(json), "channel_groups.json", "application/json");
        },
    },
};
</script>

<style>
.selected {
    border: 0.1rem outset red;
}
</style>
