import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { getPreferenceString } from "./usePreferences.js";

TimeAgo.addDefaultLocale(en);

const timeAgoInstance = new TimeAgo("en-US");

export { TimeAgo };

export const TimeAgoConfig = { locale: "en" };

export function timeFormat(duration) {
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
}

export function numberFormat(num) {
    var loc = `${getPreferenceString("hl")}-${getPreferenceString("region")}`;

    try {
        Intl.getCanonicalLocales(loc);
    } catch {
        loc = undefined;
    }

    const formatter = Intl.NumberFormat(loc, {
        notation: "compact",
    });
    return formatter.format(num);
}

export function addCommas(num) {
    num = parseInt(num);
    return num.toLocaleString("en-US");
}

export function timeAgo(time) {
    return timeAgoInstance.format(time);
}

export async function getDefaultLanguage() {
    const languages = window.navigator.languages;
    for (let i = 0; i < languages.length; i++) {
        try {
            // Dynamic import of locale files
            await import(`../locales/${languages[i]}.json`);
            return languages[i];
        } catch {
            continue;
        }
    }
    return "en";
}
