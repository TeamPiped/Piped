<template>
    <h1 v-t="'titles.subscriptions'" class="font-bold text-center my-4" />
    <!-- import / export section -->
    <div class="flex justify-between w-full">
        <div class="flex">
            <button class="btn mx-1">
                <router-link v-t="'actions.import_from_json'" to="/import" />
            </button>
            <button v-t="'actions.export_to_json'" class="btn" @click="exportHandler" />
        </div>
        <!-- subscriptions count, only shown if there are any  -->
        <i18n-t v-if="subscriptions.length > 0" keypath="subscriptions.subscribed_channels_count">{{
            subscriptions.length
        }}</i18n-t>
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
                <i class="i-fa6:edit mx-2" @click="showEditGroupModal = true"></i>
                <i class="i-fa6:circle-minus mx-2" @click="deleteGroup(group)"></i>
            </div>
        </button>
        <button class="btn mx-1">
            <i class="i-fa6:circle-plus" @click="showCreateGroupModal = true"></i>
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
            class="col m-2 p-1 border rounded-lg border-gray-500"
        >
            <router-link :to="subscription.url" class="flex p-2 font-bold text-4x4">
                <img :src="subscription.avatar" class="rounded-full h-[fit-content]" width="48" height="48" />
                <span class="self-center mx-2" v-text="subscription.name" />
            </router-link>
            <!-- subscribe / unsubscribe btn -->
            <button
                v-t="`actions.${subscription.subscribed ? 'unsubscribe' : 'subscribe'}`"
                class="btn w-full mt-2"
                @click="handleButton(subscription)"
            />
        </div>
    </div>
    <br />

    <ModalComponent v-if="showCreateGroupModal" @close="showCreateGroupModal = !showCreateGroupModal">
        <h2 v-t="'actions.create_group'" />
        <div class="flex flex-col">
            <input v-model="newGroupName" class="input my-4" type="text" :placeholder="$t('actions.group_name')" />
            <button v-t="'actions.create_group'" class="ml-auto btn w-max" @click="createGroup()" />
        </div>
    </ModalComponent>

    <ModalComponent v-if="showEditGroupModal" @close="showEditGroupModal = false">
        <div class="flex justify-between mt-3 mb-5">
            <input v-model="editedGroupName" type="text" class="input" />
            <button v-t="'actions.okay'" class="btn" :placeholder="$t('actions.group_name')" @click="editGroupName()" />
        </div>
        <div class="flex flex-col mt-3 mb-2 overflow-y-scroll h-70">
            <div v-for="subscription in subscriptions" :key="subscription.name">
                <div class="flex justify-between mr-3">
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
    },
};
</script>

<style>
.selected {
    border: 0.1rem outset red;
}
</style>
