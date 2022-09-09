<template>
    <ModalComponent>
        <h3 v-t="'titles.account'" class="font-bold my-4" />
        <hr />
        <div class="text-center">
            <form class="children:pb-3">
                <div>
                    <input
                        v-model="username"
                        class="input w-full"
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
                        class="input w-full"
                        type="password"
                        autocomplete="password"
                        :placeholder="$t('login.password')"
                        :aria-label="$t('login.password')"
                        v-on:keyup.enter="login"
                    />
                </div>
                <div class="flex justify-end">
                    <a class="btn mr-2 cursor-pointer" @click="register" v-t="'titles.register'" />
                    <a class="btn cursor-pointer" @click="login" v-t="'titles.login'" />
                </div>
            </form>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";
export default {
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
    components: { ModalComponent },
};
</script>
