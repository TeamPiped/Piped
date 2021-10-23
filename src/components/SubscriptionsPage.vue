<template>
    <div class="uk-flex uk-flex-middle uk-flex-between uk-flex-row-reverse" style="padding: 34px 0">
        <div
            class="uk-search"
            :style="{
                width: isMobile ? '100%' : '35ch',
            }"
        >
            <div class="uk-position-relative">
                <input
                    class="uk-search-input"
                    style="border-radius: 9999px; padding: 12px 18px 12px 40px;"
                    :style="{ backgroundColor: secondaryBackgroundColor }"
                    v-model="searchText"
                    type="text"
                    role="search"
                    :title="$t('actions.search')"
                    :placeholder="$t('actions.search')"
                    @keyup="onKeyUp"
                    @focus="onInputFocus"
                    @blur="onInputBlur"
                />
                <font-awesome-icon
                    icon="search"
                    style="position: absolute; x: 0px; y: 0px;"
                    class="uk-position-center-left uk-position-small"
                />
            </div>
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
                    class="uk-button uk-button-small"
                    style="background: #222; color: white"
                    type="button"
                    @click="exportHandler"
                >
                    {{ $t("actions.export_to_json") }}
                </button>
            </div>
        </div>
        <SearchSuggestions
            v-show="searchText && suggestionsVisible"
            ref="searchSuggestions"
            :search-text="searchText"
            @searchchange="onSearchTextChange"
        />

        <div
            v-if="!isMobile"
            class="uk-flex uk-flex-middle"
            style="gap: 16px; transition: transform 400ms; transform-origin: left;"
            :style="!menuCollapsed ? 'transform: scale3d(0, 0, 0);' : {}"
        >
            <img src="/img/pipedPlay.svg" style="height: 36px;" />
            <img src="/img/piped.svg" />
        </div>
    </div>

    <div v-for="subscription in subscriptions" :key="subscription.url" style="text-align: center;">
        <div class="uk-text-primary" :style="[{ background: backgroundColor }]">
            <a :href="subscription.url">
                <img :src="subscription.avatar" class="uk-margin-small-right uk-border-circle" width="96" height="96" />
                <span
                    class="uk-text-large"
                    style="width: 30rem; display: inline-block; text-align: center; margin-left: 6rem"
                    >{{ subscription.name }}</span
                >
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

    <div
        v-if="subscriptions.length == 0 && !loading"
        class="uk-text-center"
        style="text-align: center; width: 100%; margin-top: 10%;"
    >
        <img width="210" src="/img/subscriptions-no-channels.png" />
        <h3 style="font-family: MontserratBold;">{{ $t("actions.no_subscriptions_in_subscriptions_title") }}</h3>
        <p class="uk-text-center" style="line-height: 21px;">
            {{ $t("actions.no_subscriptions_in_subscriptions_1") }}<br />
            {{ $t("actions.no_subscriptions_in_subscriptions_2") }}
        </p>
    </div>
    <br />
</template>

<script>
export default {
    data() {
        return {
            subscriptions: [],
            loading: true,
        };
    },
    mounted() {
        if (this.authenticated)
            this.fetchJson(this.apiUrl() + "/subscriptions", null, {
                headers: {
                    Authorization: this.getAuthToken(),
                },
            }).then(json => {
                this.loading = false;
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

            var notifText;
            if (this.subscribed) {
                notifText = this.$t("notifications.notif_subscribe");
            } else {
                notifText = this.$t("notifications.notif_unsubscribe");
            }

            this.$notify({
                text: notifText,
                type: "success",
            });
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
