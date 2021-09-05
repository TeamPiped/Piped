<template>
    <h1 class="uk-text-bold uk-text-center">Subscriptions</h1>

    <button
        v-if="authenticated"
        @click="exportHandler"
        class="uk-button uk-button-small"
        style="background: #222"
        type="button"
    >
        {{ $t("actions.export_to_json") }}
    </button>

    <div :key="subscription.url" v-for="subscription in subscriptions">
        <div class="uk-text-primary" :style="[{ background: backgroundColor }]">
            <a :href="subscription.url">
                <img :src="subscription.avatar" class="uk-margin-small-right uk-border-circle" width="50" height="50" />
                <span class="uk-text-truncate">{{ subscription.name }}</span>
            </a>
            <button
                class="uk-button uk-button-small"
                style="background: #222"
                type="button"
                @click="handleButton(subscription)"
            >
                {{ subscription.subscribed ? $t("actions.unsubscribe") : $t("actions.subscribe") }}
            </button>
        </div>
    </div>
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
