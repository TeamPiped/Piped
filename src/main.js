import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faEye,
    faThumbtack,
    faCheck,
    faHeart,
    faHeadphones,
    faRss,
    faChevronLeft,
    faLevelDownAlt,
    faTv,
    faLevelUpAlt,
    faBroadcastTower,
    faCirclePlus,
    faCircleMinus,
    faXmark,
    faClone,
    faShare,
    faBook,
    faServer,
    faDonate,
    faBookmark,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faBitcoin, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add(
    faEye,
    faGithub,
    faBitcoin,
    faThumbtack,
    faCheck,
    faHeart,
    faHeadphones,
    faYoutube,
    faRss,
    faChevronLeft,
    faLevelDownAlt,
    faLevelUpAlt,
    faTv,
    faBroadcastTower,
    faCirclePlus,
    faCircleMinus,
    faXmark,
    faClone,
    faShare,
    faBook,
    faServer,
    faDonate,
    faBookmark,
);

import router from "@/router/router.js";
import App from "./App.vue";

import DOMPurify from "dompurify";

import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

import { createI18n } from "vue-i18n";
import enLocale from "@/locales/en.json";
import "@unocss/reset/tailwind.css";
import "uno.css";

const timeAgo = new TimeAgo("en-US");

import("./registerServiceWorker");

const mixin = {
    methods: {
        timeFormat: function (duration) {
            var pad = function (num, size) {
                return ("000" + num).slice(size * -1);
            };

            var time = parseFloat(duration).toFixed(3),
                hours = Math.floor(time / 60 / 60),
                minutes = Math.floor(time / 60) % 60,
                seconds = Math.floor(time - minutes * 60);

            var str = "";

            if (hours > 0) str += hours + ":";

            str += pad(minutes, 2) + ":" + pad(seconds, 2);

            return str;
        },
        numberFormat(num) {
            var loc = `${this.getPreferenceString("hl")}-${this.getPreferenceString("region")}`;

            try {
                Intl.getCanonicalLocales(loc);
            } catch {
                loc = undefined;
            }

            const formatter = Intl.NumberFormat(loc, {
                notation: "compact",
            });
            return formatter.format(num);
        },
        addCommas(num) {
            num = parseInt(num);
            return num.toLocaleString("en-US");
        },
        fetchJson: function (url, params, options) {
            if (params) {
                url = new URL(url);
                for (var param in params) url.searchParams.set(param, params[param]);
            }
            return fetch(url, options).then(response => {
                return response.json();
            });
        },
        purifyHTML(original) {
            return DOMPurify.sanitize(original);
        },
        setPreference(key, value, disableAlert = false) {
            try {
                localStorage.setItem(key, value);
            } catch {
                if (!disableAlert) alert(this.$t("info.local_storage"));
            }
        },
        getPreferenceBoolean(key, defaultVal) {
            var value;
            if (
                (value = new URLSearchParams(window.location.search).get(key)) !== null ||
                (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                switch (String(value).toLowerCase()) {
                    case "true":
                    case "1":
                    case "on":
                    case "yes":
                        return true;
                    default:
                        return false;
                }
            } else return defaultVal;
        },
        getPreferenceString(key, defaultVal) {
            var value;
            if (
                (value = new URLSearchParams(window.location.search).get(key)) !== null ||
                (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                return value;
            } else return defaultVal;
        },
        getPreferenceNumber(key, defaultVal) {
            var value;
            if (
                (value = new URLSearchParams(window.location.search).get(key)) !== null ||
                (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                return Number(value);
            } else return defaultVal;
        },
        getPreferenceJSON(key, defaultVal) {
            var value;
            if (
                (value = new URLSearchParams(window.location.search).get(key)) !== null ||
                (this.testLocalStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                return JSON.parse(value);
            } else return defaultVal;
        },
        apiUrl() {
            return this.getPreferenceString("instance", "https://pipedapi.kavin.rocks");
        },
        authApiUrl() {
            if (this.getPreferenceBoolean("authInstance", false)) {
                return this.getPreferenceString("auth_instance_url", this.apiUrl());
            } else return this.apiUrl();
        },
        getAuthToken() {
            return this.getPreferenceString("authToken" + this.hashCode(this.authApiUrl()));
        },
        hashCode(s) {
            return s.split("").reduce(function (a, b) {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
        },
        timeAgo(time) {
            return timeAgo.format(time);
        },
        urlify(string) {
            if (!string) return "";
            const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            const emailRegex = /([\w-\\.]+@(?:[\w-]+\.)+[\w-]{2,4})/g;
            return string
                .replace(urlRegex, url => {
                    if (url.endsWith("</a>") || url.endsWith("<a")) return url;
                    return `<a href="${url}" target="_blank">${url}</a>`;
                })
                .replace(emailRegex, email => {
                    return `<a href="mailto:${email}">${email}</a>`;
                });
        },
        async updateWatched(videos) {
            if (window.db && this.getPreferenceBoolean("watchHistory", false)) {
                var tx = window.db.transaction("watch_history", "readonly");
                var store = tx.objectStore("watch_history");
                videos.map(async video => {
                    var request = store.get(video.url.substr(-11));
                    request.onsuccess = function (event) {
                        if (event.target.result) {
                            video.watched = true;
                            video.currentTime = event.target.result.currentTime;
                        }
                    };
                });
            }
        },
        getLocalSubscriptions() {
            try {
                return JSON.parse(localStorage.getItem("localSubscriptions"));
            } catch {
                return [];
            }
        },
        isSubscribedLocally(channelId) {
            const localSubscriptions = this.getLocalSubscriptions();
            if (localSubscriptions == null) return false;
            return localSubscriptions.includes(channelId);
        },
        handleLocalSubscriptions(channelId) {
            var localSubscriptions = this.getLocalSubscriptions() ?? [];
            if (localSubscriptions.includes(channelId))
                localSubscriptions.splice(localSubscriptions.indexOf(channelId), 1);
            else localSubscriptions.push(channelId);
            // Sort for better cache hits
            localSubscriptions.sort();
            try {
                localStorage.setItem("localSubscriptions", JSON.stringify(localSubscriptions));
                return true;
            } catch {
                alert(this.$t("info.local_storage"));
            }
            return false;
        },
        getUnauthenticatedChannels() {
            const localSubscriptions = this.getLocalSubscriptions() ?? [];
            return localSubscriptions.join(",");
        },
        /* generate a temporary file and ask the user to download it */
        download(text, filename, mimeType) {
            var file = new Blob([text], { type: mimeType });

            const elem = document.createElement("a");

            elem.href = URL.createObjectURL(file);
            elem.download = filename;
            elem.click();
            elem.remove();
        },
        rewriteDescription(text) {
            return this.urlify(text)
                .replaceAll(/(?:http(?:s)?:\/\/)?(?:www\.)?youtube\.com(\/[/a-zA-Z0-9_?=&-]*)/gm, "$1")
                .replaceAll(
                    /(?:http(?:s)?:\/\/)?(?:www\.)?youtu\.be\/(?:watch\?v=)?([/a-zA-Z0-9_?=&-]*)/gm,
                    "/watch?v=$1",
                )
                .replaceAll("\n", "<br>");
        },
    },
    computed: {
        authenticated(_this) {
            return _this.getAuthToken() !== undefined;
        },
        testLocalStorage() {
            try {
                if (window.localStorage !== undefined) localStorage;
                return true;
            } catch {
                return false;
            }
        },
        async defaultLanguage() {
            const languages = window.navigator.languages;
            for (let i = 0; i < languages.length; i++) {
                try {
                    await import(`./locales/${languages[i]}.json`);
                    return languages[i];
                } catch {
                    continue;
                }
            }
            return "en";
        },
    },
    data() {
        return {
            TimeAgo: TimeAgo,
            TimeAgoConfig: timeAgo,
        };
    },
};

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
app.mixin(mixin);
app.component("FontAwesomeIcon", FontAwesomeIcon);
app.mount("#app");
