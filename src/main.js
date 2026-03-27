import { createApp } from "vue";
import router from "@/router/router.js";
import App from "./App.vue";

import { createI18n } from "vue-i18n";
import enLocale from "@/locales/en.json";
import "./app.css";

import("./registerServiceWorker");

const i18n = createI18n({
    globalInjection: true,
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {
        en: enLocale,
    },
});

window.i18n = i18n;

const app = createApp(App);
app.use(i18n);
app.use(router);
app.mount("#app");
