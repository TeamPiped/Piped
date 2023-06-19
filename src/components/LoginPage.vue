<template>
    <h1 v-t="'titles.login'" class="font-bold text-center my-4" />
    <hr />
    <div class="text-center">
        <form class="children:pb-3">
            <div>
                <input
                    v-model="username"
                    class="input"
                    type="text"
                    autocomplete="username"
                    :placeholder="$t('login.username')"
                    :aria-label="$t('login.username')"
                    v-on:keyup.enter="login"
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
                    v-on:keyup.enter="login"
                />
            </div>
            <div>
                <a class="btn w-auto" @click="login" v-t="'titles.login'" />
            </div>
            <ul class="md:flex-1 md:justify-center md:flex">
                <li v-for="provider in oidcProviders" :key="provider.name">
                    <a class="btn w-auto" :href="provider.authUri">Log in with {{ provider.name }}</a>
                </li>
            </ul>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: null,
            password: null,
            oidcProviders: null,
        };
    },
    mounted() {
        //TODO: Maybe there is a better way to do this?
        const urlParams = new URLSearchParams(window.location.search);
        const session = urlParams.get("session");
        if (session) {
            this.setPreference("authToken" + this.hashCode(this.authApiUrl()), session);
            this.$router.push("/");
        }
        this.fetchConfig();
        //TODO: Add Server Side check
        if (this.getAuthToken()) {
            this.$router.push("/");
        }
    },
    activated() {
        document.title = this.$t("titles.login") + " - Piped";
    },
    methods: {
        async fetchConfig() {
            this.fetchJson(this.apiUrl() + "/config").then(config => {
                this.oidcProviders = config?.oidcProviders.map(name => {
                    return {
                        name,
                        authUri: `${this.authApiUrl()}/oidc/${name}/login?redirect=${window.location.origin}/login`,
                    };
                });
            });
        },
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
