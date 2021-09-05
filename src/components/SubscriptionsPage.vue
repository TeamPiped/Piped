<template>
    <h1 class="uk-text-bold uk-text-center">{{ $t("titles.subscriptions") }}</h1>


    <div style="text-align: center">
        <button
            v-if="authenticated"
            class="uk-button uk-button-small"
            style="background: #222; margin-right: 0.5rem"
            type="button"
        >
            <router-link to="/import">
                {{ $t("actions.import_from_json") }}
            </router-link>
        </button>

        <button
            v-if="authenticated"
            @click="exportHandler"
            class="uk-button uk-button-small"
            style="background: #222; color: white"
            type="button"
        >
            {{ $t("actions.export_to_json") }}
        </button>

    </div>
        <hr />


        <div :key="subscription.url" v-for="subscription in subscriptions" style="text-align: center;">
            <div class="uk-text-primary" :style="[{ background: backgroundColor }]">
                <a :href="subscription.url">
                    <img :src="subscription.avatar" class="uk-margin-small-right uk-border-circle" width="96" height="96" />
                    <span class="uk-text-large" style="width: 30rem; display: inline-block; text-align: center; margin-left: 6rem">{{ subscription.name }}</span>
                </a>
                <button
                    class="uk-button uk-button-large"
                    style="background: #222; margin-left: 0.5rem; width: 185px"
                    type="button"
                    @click="handleButton(subscription)"
                >
                    {{ subscription.subscribed ? $t("actions.unsubscribe") : $t("actions.subscribe") }}
                </button>
            </div>
            <br />
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
