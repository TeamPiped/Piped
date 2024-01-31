<template>
    <div class="flex justify-center">
        <h1 v-t="'titles.login'" class="my-4 text-center font-bold" />
        <TooltipIcon class="mb-6" icon="i-fa6-solid:circle-info" :tooltip="$t('info.login_note')" />
    </div>
    <hr />
    <div class="w-full flex items-center justify-center text-center">
        <form class="w-min children:pb-3">
            <div>
                <input
                    v-model="username"
                    class="input"
                    type="text"
                    autocomplete="username"
                    :placeholder="$t('login.username')"
                    :aria-label="$t('login.username')"
                    @keyup.enter="login"
                />
            </div>
            <div>
                <input
                    v-model="password"
                    class="input"
                    type="password"
                    autocomplete="password"
                    :placeholder="$t('login.password')"
                    :aria-label="$t('login.password')"
                    @keyup.enter="login"
                />
            </div>
            <div>
                <a v-t="'titles.login'" class="btn w-auto" @click="login" />
            </div>
        </form>
    </div>
</template>

<script>
import TooltipIcon from "./TooltipIcon.vue";

export default {
    components: {
        TooltipIcon,
    },
    data() {
        return {
            username: null,
            password: null,
        };
    },
    mounted() {
        //TODO: Add Server Side check
        if (this.getAuthToken()) {
            this.$router.push("/");
        }
    },
    activated() {
        document.title = this.$t("titles.login") + " - Piped";
    },
    methods: {
        login() {
            if (!this.username || !this.password) return;
            this.fetchJson(this.authApiUrl() + "/login", null, {
                method: "POST",
                body: JSON.stringify({
                    username: this.username,
                    password: this.password,
                }),
            }).then(resp => {
                if (resp.token) {
                    this.setPreference("authToken" + this.hashCode(this.authApiUrl()), resp.token);
                    window.location = "/"; // done to bypass cache
                } else alert(resp.error);
            });
        },
    },
};
</script>
