import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import { getPreferenceString } from "./usePreferences.js";

TimeAgo.addDefaultLocale(en);

const timeAgoInstance = new TimeAgo("en-US");

export { TimeAgo };

export const TimeAgoConfig = { locale: "en" };

export function timeFormat(duration) {
    const pad = (num, size) => {
        return ("000" + num).slice(size * -1);
    };

    const time = parseFloat(duration).toFixed(3);
    const hours = Math.floor(time / 60 / 60);
    const minutes = Math.floor(time / 60) % 60;
    const seconds = Math.floor(time % 60);

    let str = "";

    if (hours > 0) str += hours + ":";

    str += pad(minutes, 2) + ":" + pad(seconds, 2);

    return str;
}

export function numberFormat(num) {
    let loc = `${getPreferenceString("hl")}-${getPreferenceString("region")}`;

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
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return num;
    return parsed.toLocaleString("en-US");
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
