<template>
    <ModalComponent>
        <h5 v-t="'titles.account'" class="my-4 font-bold" />
        <hr />
        <div class="text-center">
            <form class="children:pb-3">
                <div>
                    <input
                        v-model="username"
                        class="m-0"
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
                        class="m-0"
                        type="password"
                        autocomplete="password"
                        :placeholder="$t('login.password')"
                        :aria-label="$t('login.password')"
                        @keyup.enter="login"
                    />
                </div>
                <div class="flex justify-end p-0!" style="gap: var(--efy_gap0)">
                    <a v-t="'titles.register'" role="button" class="m-0!" @click="register" />
                    <a v-t="'titles.login'" role="button" class="m-0!" @click="login" />
                </div>
            </form>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";
export default {
    components: { ModalComponent },
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
        document.title = this.$t("titles.account") + " - Piped";
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
        register() {
            if (!this.username || !this.password) return;
            this.fetchJson(this.authApiUrl() + "/register", null, {
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
