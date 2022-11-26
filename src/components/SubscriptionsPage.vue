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
    <!-- Subscriptions card list -->
    <div class="xl:grid xl:grid-cols-5 <md:flex-wrap">
        <!-- channel info card -->
        <div
            class="col m-2 p-1 border rounded-lg border-gray-500"
            v-for="subscription in subscriptions"
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
</template>

<script>
export default {
    data() {
        return {
            subscriptions: [],
        };
    },
    mounted() {
        this.fetchSubscriptions().then(json => {
            this.subscriptions = json;
            this.subscriptions.forEach(subscription => (subscription.subscribed = true));
        });
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
    },
};
</script>
