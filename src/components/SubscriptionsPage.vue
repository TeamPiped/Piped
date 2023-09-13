<template>
    <hr />
    <!-- import / export section -->
    <div class="flex justify-between flex-wrap m0c">
        <div efy_card class="w-auto!" style="padding: var(--efy_padding)">
            <i18n-t keypath="titles.subscriptions" efy_card />{{ ": " + subscriptions.length }}
        </div>
        <div class="m0c flex flex-wrap">
            <router-link v-t="'actions.import_from_json_csv'" to="/import" role="button" />
            <button v-t="'actions.export_to_json'" @click="exportHandler" />
            <input
                id="fileSelector"
                ref="fileSelector"
                type="file"
                class="display-none"
                multiple="multiple"
                @change="importGroupsHandler"
            />
            <label
                for="fileSelector"
                role="button"
                v-text="`${$t('actions.import_from_json')} (${$t('titles.channel_groups')})`"
                class="font-bold"
            />
            <button
                @click="exportGroupsHandler"
                v-text="`${$t('actions.export_to_json')} (${$t('titles.channel_groups')})`"
            />
        </div>
    </div>
    <hr />
    <div class="m0c w-full flex flex-wrap">
        <button
            v-for="group in channelGroups"
            :key="group.groupName"
            class="flex gap-[10rem] items-center"
            :class="{ selected: selectedGroup === group }"
            @click="selectGroup(group)"
        >
            <span v-text="group.groupName !== '' ? group.groupName : $t('video.all')" />
            <div v-if="group.groupName != '' && selectedGroup == group" class="flex flex-wrap gap-[10rem] items-center">
                <div>|</div>
                <font-awesome-icon class="mx-2" icon="edit" @click="showEditGroupModal = true" />
                <div>|</div>
                <font-awesome-icon class="mx-2" icon="circle-minus" @click="deleteGroup(group)" />
            </div>
        </button>
        <button class="btn mx-1">
            <font-awesome-icon icon="circle-plus" @click="showCreateGroupModal = true" />
        </button>
    </div>
    <hr />
    <!-- Subscriptions card list -->
    <div class="pp-subs-cards">
        <!-- channel info card -->
        <div v-for="subscription in filteredSubscriptions" :key="subscription.url" efy_card class="pp-subs-card">
            <router-link :to="subscription.url" class="pp-import-channel flex font-bold">
                <img :src="subscription.avatar" width="48" height="48" />
                <span class="mx-2" v-text="subscription.name" />
            </router-link>
            <!-- (un)subscribe btn -->
            <button
                v-t="`actions.${subscription.subscribed ? 'unsubscribe' : 'subscribe'}`"
                class="btn mt-2 w-full"
                @click="handleButton(subscription)"
            />
        </div>
    </div>

    <ModalComponent v-if="showCreateGroupModal" @close="showCreateGroupModal = !showCreateGroupModal">
        <h2 v-t="'actions.create_group'" />
        <div class="flex flex-col">
            <input v-model="newGroupName" class="input my-4" type="text" :placeholder="$t('actions.group_name')" />
            <button v-t="'actions.create_group'" class="btn ml-auto w-max" @click="createGroup()" />
        </div>
    </ModalComponent>

    <ModalComponent v-if="showEditGroupModal" @close="showEditGroupModal = false">
        <div class="mb-5 mt-3 flex justify-between">
            <input v-model="editedGroupName" type="text" class="input" />
            <button v-t="'actions.okay'" class="btn" :placeholder="$t('actions.group_name')" @click="editGroupName()" />
        </div>
        <div class="mb-2 mt-3 flex flex-col overflow-y-scroll" style="height: 300rem">
            <div v-for="subscription in subscriptions" :key="subscription.name">
                <div class="mr-3 flex justify-between">
                    <span>{{ subscription.name }}</span>
                    <input
                        type="checkbox"
                        class="checkbox"
                        :checked="selectedGroup.channels.includes(subscription.url.substr(-11))"
                        @change="checkedChange(subscription)"
                    />
                </div>
                <hr />
            </div>
        </div>
    </ModalComponent>
</template>

<style>
.pp-subs-cards {
    display: grid;
    gap: var(--efy_gap);
    grid-template-columns: repeat(auto-fill, minmax(240rem, 1fr));
}
.pp-subs-card :is(a, span) {
    -webkit-text-fill-color: var(--efy_text) !important;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.pp-subs-card button {
    margin-bottom: 0;
    width: 100%;
}
.selected {
}
.m0c {
    gap: var(--efy_gap0);
}
.m0c :is(button, [role="button"]) {
    margin: 0;
}
</style>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: { ModalComponent },
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
            newGroupName: "",
            editedGroupName: "",
        };
    },
    computed: {
        filteredSubscriptions(_this) {
            return _this.selectedGroup.groupName == ""
                ? _this.subscriptions
                : _this.subscriptions.filter(channel => _this.selectedGroup.channels.includes(channel.url.substr(-11)));
        },
    },
    mounted() {
        this.fetchSubscriptions().then(json => {
            this.subscriptions = json;
            this.subscriptions.forEach(subscription => (subscription.subscribed = true));
        });

        this.channelGroups.push(this.selectedGroup);

        if (!window.db) return;
        const cursor = this.getChannelGroupsCursor();
        cursor.onsuccess = e => {
            const cursor = e.target.result;
            if (cursor) {
                const group = cursor.value;
                this.channelGroups.push({
                    groupName: group.groupName,
                    channels: JSON.parse(group.channels),
                });
                cursor.continue();
            }
        };
    },
    activated() {
        document.title = "Subscriptions - Piped";
    },
    methods: {
        async fetchSubscriptions() {
            if (this.authenticated) {
                return await this.fetchJson(this.authApiUrl() + "/subscriptions", null, {
                    headers: {
                        Authorization: this.getAuthToken(),
                    },
                });
            } else {
                return await this.fetchJson(this.authApiUrl() + "/subscriptions/unauthenticated", {
                    channels: this.getUnauthenticatedChannels(),
                });
            }
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
        createGroup() {
            if (!this.newGroupName || this.channelGroups.some(group => group.groupName == this.newGroupName)) return;

            const newGroup = {
                groupName: this.newGroupName,
                channels: [],
            };
            this.channelGroups.push(newGroup);
            this.createOrUpdateChannelGroup(newGroup);

            this.newGroupName = "";

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
            this.deleteChannelGroup(group.groupName);
            this.channelGroups = this.channelGroups.filter(g => g != group);
            this.selectedGroup = this.channelGroups[0];
        },
        checkedChange(subscription) {
            const channelId = subscription.url.substr(-11);
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
