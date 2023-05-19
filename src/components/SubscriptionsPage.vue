<template>
    <h1 class="font-bold text-center my-4" v-t="'titles.subscriptions'" />
    <!-- import / export section -->
    <div class="flex justify-between w-full">
        <div class="flex">
            <button class="btn mx-1">
                <router-link to="/import" v-t="'actions.import_from_json'" />
            </button>
            <button class="btn" @click="exportHandler" v-t="'actions.export_to_json'" />
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
            class="btn mx-1 w-max"
            :class="{ selected: selectedGroup === group }"
            :key="group.groupName"
            @click="selectedGroup = group"
        >
            <span v-text="group.groupName !== '' ? group.groupName : $t('video.all')" />
            <div v-if="group.groupName != '' && selectedGroup == group">
                <font-awesome-icon class="mx-2" icon="edit" @click="showEditGroupModal = true" />
                <font-awesome-icon class="mx-2" icon="circle-minus" @click="deleteGroup(group)" />
            </div>
        </button>
        <button class="btn mx-1">
            <font-awesome-icon icon="circle-plus" @click="showCreateGroupModal = true" />
        </button>
    </div>
    <br />
    <hr />
    <!-- Subscriptions card list -->
    <div class="xl:grid xl:grid-cols-5 <md:flex-wrap">
        <!-- channel info card -->
        <div
            class="col m-2 p-1 border rounded-lg border-gray-500"
            v-for="subscription in filteredSubscriptions"
            :key="subscription.url"
        >
            <router-link :to="subscription.url" class="flex p-2 font-bold text-4x4">
                <img :src="subscription.avatar" class="rounded-full h-[fit-content]" width="48" height="48" />
                <span class="self-center mx-2" v-text="subscription.name" />
            </router-link>
            <!-- subscribe / unsubscribe btn -->
            <button
                class="btn w-full mt-2"
                @click="handleButton(subscription)"
                v-t="`actions.${subscription.subscribed ? 'unsubscribe' : 'subscribe'}`"
            />
        </div>
    </div>
    <br />

    <ModalComponent v-if="showCreateGroupModal" @close="showCreateGroupModal = !showCreateGroupModal">
        <h2 v-t="'actions.create_group'" />
        <div class="flex flex-col">
            <input class="input my-4" type="text" v-model="newGroupName" :placeholder="$t('actions.group_name')" />
            <button class="ml-auto btn w-max" v-t="'actions.create_group'" @click="createGroup()" />
        </div>
    </ModalComponent>

    <ModalComponent v-if="showEditGroupModal" @close="showEditGroupModal = false">
        <h2>{{ selectedGroup.groupName }}</h2>
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
        };
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
    computed: {
        filteredSubscriptions(_this) {
            return _this.selectedGroup.groupName == ""
                ? _this.subscriptions
                : _this.subscriptions.filter(channel => _this.selectedGroup.channels.includes(channel.url.substr(-11)));
        },
    },
    components: { ModalComponent },
};
</script>

<style>
.selected {
    border: 0.1rem outset red;
}
</style>
