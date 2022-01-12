<template>
    <h1 class="font-bold text-center" v-text="$t('titles.subscriptions')" />

    <div v-if="authenticated">
        <button class="btn mr-0.5">
            <router-link to="/import" v-text="$t('actions.import_from_json')" />
        </button>

        <button class="btn" @click="exportHandler" v-text="$t('actions.export_to_json')" />
    </div>
    <hr />

    <div class="grid">
        <div class="mb-3" v-for="subscription in subscriptions" :key="subscription.url">
            <div class="flex justify-center place-items-center">
                <div class="w-full grid grid-cols-3">
                    <router-link :to="subscription.url" class="col-start-2 block flex text-center font-bold text-4xl">
                        <img :src="subscription.avatar" class="rounded-full" width="48" height="48" />
                        <span v-text="subscription.name" />
                    </router-link>
                    <button
                        class="btn !w-min"
                        @click="handleButton(subscription)"
                        v-text="$t(`actions.${subscription.subscribed ? 'unsubscribe' : 'subscribe'}`)"
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
        if (this.authenticated)
            this.fetchJson(this.apiUrl() + "/subscriptions", null, {
                headers: {
                    Authorization: this.getAuthToken(),
                },
            }).then(json => {
                this.subscriptions = json;
                this.subscriptions.forEach(subscription => (subscription.subscribed = true));
            });
        else this.$router.push("/login");
    },
    activated() {
        document.title = "Subscriptions - Piped";
    },
    methods: {
        handleButton(subscription) {
            this.fetchJson(this.apiUrl() + (subscription.subscribed ? "/unsubscribe" : "/subscribe"), null, {
                method: "POST",
                body: JSON.stringify({
                    channelId: subscription.url.split("/")[2],
                }),
                headers: {
                    Authorization: this.getAuthToken(),
                    "Content-Type": "application/json",
                },
            });
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

            var file = new Blob([json], { type: "application/json" });

            const elem = document.createElement("a");

            elem.href = URL.createObjectURL(file);
            elem.download = "subscriptions.json";
            elem.click();
            elem.remove();
        },
    },
};
</script>
