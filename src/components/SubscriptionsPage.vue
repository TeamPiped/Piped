<template>
    <h1 class="uk-text-bold uk-text-center">Subscriptions</h1>

    <div :key="subscription.url" v-for="subscription in subscriptions">
        <div class="uk-text-primary" :style="[{ background: backgroundColor }]">
            <a :href="subscription.url">
                <img :src="subscription.avatar" class="uk-margin-small-right" width="50" height="50" />
                <span class="uk-text-truncate">{{ subscription.name }}</span>
            </a>
            <button
                class="uk-button uk-button-small"
                style="background: #222"
                type="button"
                @click="handleButton(subscription)"
            >
                {{ subscription.subscribed ? "Unsubscribe" : "Subscribe" }}
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
    },
};
</script>
