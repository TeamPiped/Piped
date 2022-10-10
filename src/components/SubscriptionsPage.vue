<template>
    <div class="flex justify-between w-full">
        <div class="flex">
            <button class="btn mr-2">
                <router-link to="/import" v-t="'actions.import_from_json'" />
            </button>
            <button class="btn" @click="exportHandler" v-t="'actions.export_to_json'" />
        </div>
        <i18n-t keypath="subscriptions.subscribed_channels_count">{{ subscriptions.length }}</i18n-t>
    </div>
    <hr />

    <div class="grid">
        <div class="mb-3" v-for="subscription in subscriptions" :key="subscription.url">
            <div class="flex justify-center place-items-center">
                <div class="w-full flex justify-between items-center">
                    <router-link :to="subscription.url" class="pp-import-channel flex font-bold">
                        <img :src="subscription.avatar" width="48" height="48" />
                        <span class="mx-2" v-text="subscription.name" />
                    </router-link>
                    <button
                        class="btn w-fit"
                        @click="handleButton(subscription)"
                        v-t="`actions.${subscription.subscribed ? 'unsubscribe' : 'subscribe'}`"
                    />
                </div>
            </div>
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
