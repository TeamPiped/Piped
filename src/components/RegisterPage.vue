<template>
    <div class="flex justify-center">
        <h1 v-t="'titles.register'" class="my-4 text-center font-bold" />
        <i-fa6-solid-circle-info class="mt-6 ml-2 cursor-pointer" :title="$t('info.register_note')" />
    </div>
    <hr />
    <div class="flex flex-col items-center justify-center text-center">
        <form class="w-max items-center px-3 *:pb-3">
            <div>
                <input
                    v-model="username"
                    class="h-8 w-full rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                    type="text"
                    autocomplete="username"
                    :placeholder="$t('login.username')"
                    :aria-label="$t('login.username')"
                    @keyup.enter="register"
                />
            </div>
            <div class="flex justify-center">
                <input
                    v-model="password"
                    class="h-auto w-full rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="password"
                    :placeholder="$t('login.password')"
                    :aria-label="$t('login.password')"
                    @keyup.enter="register"
                />
                <button
                    type="button"
                    class="ml-2 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="showPassword = !showPassword"
                >
                    <i-fa6-solid-eye />
                </button>
            </div>
            <div class="flex justify-center">
                <input
                    v-model="passwordConfirm"
                    class="h-auto w-full rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    autocomplete="password"
                    :placeholder="$t('login.password_confirm')"
                    :aria-label="$t('login.password_confirm')"
                    @keyup.enter="register"
                />
                <button
                    type="button"
                    class="ml-2 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="showConfirmPassword = !showConfirmPassword"
                >
                    <i-fa6-solid-eye />
                </button>
            </div>
            <div>
                <a
                    v-t="'titles.register'"
                    class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="register"
                />
            </div>
        </form>
    </div>
    <ConfirmModal
        v-if="showUnsecureRegisterDialog"
        :message="$t('info.register_no_email_note')"
        @close="showUnsecureRegisterDialog = false"
        @confirm="
            forceUnsecureRegister = true;
            showUnsecureRegisterDialog = false;
            register();
        "
    />
</template>

<script setup>
import { ref, onMounted, onActivated } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { isEmail } from "../utils/Misc.js";
import ConfirmModal from "./ConfirmModal.vue";
import { fetchJson, authApiUrl, getAuthToken, hashCode } from "@/composables/useApi.js";
import { setPreference } from "@/composables/usePreferences.js";

const router = useRouter();
const { t } = useI18n();

const username = ref(null);
const password = ref(null);
const passwordConfirm = ref(null);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const showUnsecureRegisterDialog = ref(false);
const forceUnsecureRegister = ref(false);

onMounted(() => {
    //TODO: Add Server Side check
    if (getAuthToken()) {
        router.push(import.meta.env.BASE_URL);
    }
});

onActivated(() => {
    document.title = "Register - Piped";
});

function register() {
    if (!username.value || !password.value) return;
    if (password.value != passwordConfirm.value) {
        alert(t("login.passwords_incorrect"));
        return;
    }
    if (isEmail(username.value) && !forceUnsecureRegister.value) {
        showUnsecureRegisterDialog.value = true;
        return;
    }
    fetchJson(authApiUrl() + "/register", null, {
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
