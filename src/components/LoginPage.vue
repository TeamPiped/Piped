<template>
    <div class="flex justify-center">
        <h1 v-t="'titles.login'" class="my-4 text-center font-bold" />
        <i-fa6-solid-circle-info class="mt-6 ml-2 cursor-pointer" :title="$t('info.login_note')" />
    </div>
    <hr />
    <div class="flex w-full items-center justify-center text-center">
        <form class="w-min *:pb-3">
            <div>
                <input
                    v-model="username"
                    class="h-8 rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
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
                    class="h-8 rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                    type="password"
                    autocomplete="password"
                    :placeholder="$t('login.password')"
                    :aria-label="$t('login.password')"
                    @keyup.enter="login"
                />
            </div>
            <div>
                <a
                    v-t="'titles.login'"
                    class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="login"
                />
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { fetchJson, authApiUrl, getAuthToken, hashCode } from "@/composables/useApi.js";
import { setPreference } from "@/composables/usePreferences.js";

const router = useRouter();
const { t } = useI18n();

const username = ref(null);
const password = ref(null);

onMounted(() => {
    //TODO: Add Server Side check
    if (getAuthToken()) {
        router.push(import.meta.env.BASE_URL);
    }
});

onActivated(() => {
    document.title = t("titles.login") + " - Piped";
});

function login() {
    if (!username.value || !password.value) return;
    fetchJson(authApiUrl() + "/login", null, {
        method: "POST",
        body: JSON.stringify({
            username: username.value,
            password: password.value,
        }),
    }).then(resp => {
        if (resp.token) {
            setPreference("authToken" + hashCode(authApiUrl()), resp.token);
            window.location = import.meta.env.BASE_URL; // done to bypass cache
        } else alert(resp.error);
    });
}
</script>
