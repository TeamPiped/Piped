import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faThumbsUp,
    faThumbsDown,
    faEye,
    faThumbtack,
    faCheck,
    faHeart,
    faHeadphones,
    faRss,
} from "@fortawesome/free-solid-svg-icons";
import { faGithub, faBitcoin, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add(
    faThumbsUp,
    faThumbsDown,
    faEye,
    faGithub,
    faBitcoin,
    faThumbtack,
    faCheck,
    faHeart,
    faHeadphones,
    faYoutube,
    faRss,
);

import("uikit/dist/css/uikit-core.css");
import("uikit/dist/js/uikit-core.min");

import router from "@/router/router";
import App from "./App.vue";

import DOMPurify from "dompurify";

import("./registerServiceWorker");

const mixin = {
    methods: {
        timeFormat: function(duration) {
            var pad = function(num, size) {
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
            const digits = 2;
            const si = [
                { value: 1, symbol: "" },
                { value: 1e3, symbol: "k" },
                { value: 1e6, symbol: "M" },
                { value: 1e9, symbol: "B" },
            ];
            const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
            for (var i = si.length - 1; i > 0; i--) {
                if (num >= si[i].value) {
                    break;
                }
            }
            return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
        },
        addCommas(num) {
            num = parseInt(num);
            return num.toLocaleString("en-US");
        },
        fetchJson: function(url, params, options) {
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
        setPreference(key, value) {
            if (localStorage) localStorage.setItem(key, value);
        },
        getPreferenceBoolean(key, defaultVal) {
            var value;
            if (
                (value = this.$route.query[key]) !== undefined ||
                (localStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                switch (String(value)) {
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
                (value = this.$route.query[key]) !== undefined ||
                (localStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                return value;
            } else return defaultVal;
        },
        getPreferenceNumber(key, defaultVal) {
            var value;
            if (
                (value = this.$route.query[key]) !== undefined ||
                (localStorage && (value = localStorage.getItem(key)) !== null)
            ) {
                return Number(value);
            } else return defaultVal;
        },
        apiUrl() {
            return this.getPreferenceString("instance", "https://pipedapi.kavin.rocks");
        },
        getEffectiveTheme() {
            var theme = this.getPreferenceString("theme", "dark");
            if (theme === "auto")
                theme =
                    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            return theme;
        },
        getAuthToken() {
            return this.getPreferenceString("authToken" + this.hashCode(this.apiUrl()));
        },
        hashCode(s) {
            return s.split("").reduce(function(a, b) {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
            }, 0);
        },
    },
    computed: {
        backgroundColor() {
            return this.getEffectiveTheme() === "light" ? "#fff" : "#0b0e0f";
        },
        secondaryBackgroundColor() {
            return this.getEffectiveTheme() === "light" ? "#e5e5e5" : "#242727";
        },
        foregroundColor() {
            return this.getEffectiveTheme() === "light" ? "#15191a" : "#0b0e0f";
        },
        secondaryForegroundColor() {
            return this.getEffectiveTheme() === "light" ? "#666" : "#393d3d";
        },
        darkMode() {
            return this.getEffectiveTheme() !== "light";
        },
    },
};

const app = createApp(App);
app.use(router);
app.mixin(mixin);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
