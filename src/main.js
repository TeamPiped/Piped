import { createApp } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faThumbsUp, faThumbsDown, faEye, faThumbtack, faCheck, faHeart, faHeadphones } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faBitcoin } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add(faThumbsUp, faThumbsDown, faEye, faGithub, faBitcoin, faThumbtack, faCheck, faHeart, faHeadphones);

import("uikit/dist/css/uikit-core.css");
import("uikit/dist/js/uikit-core.min");

import router from "@/router/router";
import App from "./App.vue";

import DOMPurify from 'dompurify';

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
            const digits = 2;
            const si = [
                { value: 1, symbol: "" },
                { value: 1E3, symbol: "k" },
                { value: 1E6, symbol: "M" },
                { value: 1E9, symbol: "B" }
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
            num = parseInt(num)
            return num.toLocaleString('en-US')
        },
        fetchJson: function (url, params, options) {
            if (params) {
                url = new URL(url);
                for (var param in params)
                    url.searchParams.set(param, params[param])
            }
            return fetch(url, options).then(response => {
                return response.json();
            });
        },
        purifyHTML(original) {
            return DOMPurify.sanitize(original);
        }
    },
    computed: {
        backgroundColor() {
            return localStorage.getItem("theme") === "light" ? "#fff" : "#0b0e0f"
        },
        secondaryBackgroundColor() {
            return localStorage.getItem("theme") === "light" ? "#e5e5e5" : "#242727"
        },
        foregroundColor() {
            return localStorage.getItem("theme") === "light" ? "#15191a" : "#0b0e0f"
        },
        secondaryForegroundColor() {
            return localStorage.getItem("theme") === "light" ? "#666" : "#393d3d"
        },
        darkMode() {
            return localStorage.getItem('theme') !== 'light'
        }
    }
};

const app = createApp(App);
app.use(router);
app.mixin(mixin);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount("#app");
