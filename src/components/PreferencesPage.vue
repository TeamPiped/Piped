<template>
    <div class="flex">
        <button @click="$router.go(-1) || $router.push('/')">
            <i class="i-fa6-solid:chevron-left" /><span v-t="'actions.back'" class="ml-1.5" />
        </button>
    </div>
    <h1 v-t="'titles.preferences'" class="text-center font-bold" />
    <hr />
    <label for="ddlTheme" class="pref">
        <strong v-t="'actions.theme'" />
        <select id="ddlTheme" v-model="selectedTheme" class="select w-auto" @change="onChange($event)">
            <option v-t="'actions.auto'" value="auto" />
            <option v-t="'actions.dark'" value="dark" />
            <option v-t="'actions.light'" value="light" />
        </select>
    </label>
    <label class="pref" for="ddlLanguageSelection">
        <strong v-t="'actions.language_selection'" />
        <select id="ddlLanguageSelection" v-model="selectedLanguage" class="select w-auto" @change="onChange($event)">
            <option v-for="language in languages" :key="language.code" :value="language.code" v-text="language.name" />
        </select>
    </label>
    <label class="pref" for="ddlCountrySelection">
        <strong v-t="'actions.country_selection'" />
        <select id="ddlCountrySelection" v-model="countrySelected" class="select w-50" @change="onChange($event)">
            <option v-for="country in countryMap" :key="country.code" :value="country.code" v-text="country.name" />
        </select>
    </label>
    <label class="pref" for="ddlDefaultHomepage">
        <strong v-t="'actions.default_homepage'" />
        <select id="ddlDefaultHomepage" v-model="defaultHomepage" class="select w-auto" @change="onChange($event)">
            <option v-t="'titles.trending'" value="trending" />
            <option v-t="'titles.feed'" value="feed" />
        </select>
    </label>

    <h2 v-t="'titles.player'" class="text-center" />
    <label class="pref" for="chkAutoPlayVideo">
        <strong v-t="'actions.autoplay_video'" />
        <input
            id="chkAutoPlayVideo"
            v-model="autoPlayVideo"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkAutoDisplayCaptions">
        <strong v-t="'actions.auto_display_captions'" />
        <input
            id="chkAutoDisplayCaptions"
            v-model="autoDisplayCaptions"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkAutoPlayNextCountdown">
        <strong v-t="'actions.autoplay_next_countdown'" />
        <input
            id="chkAutoPlayNextCountdown"
            v-model="autoPlayNextCountdown"
            class="input w-24"
            type="number"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkAudioOnly">
        <strong v-t="'actions.audio_only'" />
        <input id="chkAudioOnly" v-model="listen" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>
    <label class="pref" for="chkPreferHls">
        <strong v-t="'actions.prefer_hls'" />
        <input id="chkPreferHls" v-model="preferHls" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>
    <label class="pref" for="ddlDefaultQuality">
        <strong v-t="'actions.default_quality'" />
        <select id="ddlDefaultQuality" v-model="defaultQuality" class="select w-auto" @change="onChange($event)">
            <option v-t="'actions.auto'" value="0" />
            <option v-for="resolution in resolutions" :key="resolution" :value="resolution" v-text="`${resolution}p`" />
        </select>
    </label>
    <label class="pref" for="txtBufferingGoal">
        <strong v-t="'actions.buffering_goal'" />
        <input
            id="txtBufferingGoal"
            v-model="bufferingGoal"
            class="input w-24"
            type="text"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkMinimizeComments">
        <strong v-t="'actions.minimize_comments_default'" />
        <input
            id="chkMinimizeComments"
            v-model="minimizeComments"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkMinimizeDescription">
        <strong v-t="'actions.minimize_description_default'" />
        <input
            id="chkMinimizeDescription"
            v-model="minimizeDescription"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkMinimizeRecommendations">
        <strong v-t="'actions.minimize_recommendations_default'" />
        <input
            id="chkMinimizeRecommendations"
            v-model="minimizeRecommendations"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkMinimizeChapters">
        <strong v-t="'actions.minimize_chapters_default'" />
        <input
            id="chkMinimizeChapters"
            v-model="minimizeChapters"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <!-- chapters layout on mobile -->
    <label class="pref lg:invisible" for="chkMinimizeChapters">
        <strong v-t="'actions.chapters_layout_mobile'" />

        <select id="ddlDefaultHomepage" v-model="mobileChapterLayout" class="select w-auto" @change="onChange($event)">
            <option v-t="'video.chapters_horizontal'" value="Horizontal" />
            <option v-t="'video.chapters_vertical'" value="Vertical" />
        </select>
    </label>
    <label class="pref" for="chkShowWatchOnYouTube">
        <strong v-t="'actions.show_watch_on_youtube'" />
        <input
            id="chkShowWatchOnYouTube"
            v-model="showWatchOnYouTube"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkShowSearchSuggestions">
        <strong v-t="'actions.show_search_suggestions'" />
        <input
            id="chkShowSearchSuggestions"
            v-model="searchSuggestions"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkStoreSearchHistory">
        <strong v-t="'actions.store_search_history'" />
        <input
            id="chkStoreSearchHistory"
            v-model="searchHistory"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="chkStoreWatchHistory">
        <strong v-t="'actions.store_watch_history'" />
        <input
            id="chkStoreWatchHistory"
            v-model="watchHistory"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label v-if="watchHistory" class="pref" for="chkHideWatched">
        <strong v-t="'actions.hide_watched'" />
        <input id="chkHideWatched" v-model="hideWatched" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>
    <label class="pref" for="ddlEnabledCodecs">
        <strong v-t="'actions.enabled_codecs'" />
        <select
            id="ddlEnabledCodecs"
            v-model="enabledCodecs"
            class="select h-auto w-auto"
            multiple
            @change="onChange($event)"
        >
            <option value="av1">AV1</option>
            <option value="vp9">VP9</option>
            <option value="avc">AVC (h.264)</option>
        </select>
    </label>
    <label class="pref" for="chkDisableLBRY">
        <strong v-t="'actions.disable_lbry'" />
        <input id="chkDisableLBRY" v-model="disableLBRY" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>
    <label class="pref" for="chkEnableLBRYProxy">
        <strong v-t="'actions.enable_lbry_proxy'" />
        <input
            id="chkEnableLBRYProxy"
            v-model="proxyLBRY"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <label class="pref" for="txtPrefetchLimit">
        <strong v-t="'actions.concurrent_prefetch_limit'" />
        <input
            id="txtPrefetchLimit"
            v-model="prefetchLimit"
            class="input w-24"
            type="text"
            @change="onChange($event)"
        />
    </label>

    <h2 class="text-center">SponsorBlock</h2>
    <p class="text-center">
        <span v-t="'actions.uses_api_from'" /><a class="link" href="https://sponsor.ajay.app/">sponsor.ajay.app</a>
    </p>
    <label class="pref" for="chkEnableSponsorblock">
        <strong v-t="'actions.enable_sponsorblock'" />
        <input
            id="chkEnableSponsorblock"
            v-model="sponsorBlock"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <div v-if="sponsorBlock">
        <label v-for="[name, item] in skipOptions" :key="name" class="pref" :for="'ddlSkip_' + name">
            <strong v-t="item.label" />
            <select :id="'ddlSkip_' + name" v-model="item.value" class="select w-auto" @change="onChange($event)">
                <option v-t="'actions.no'" value="no" />
                <option v-t="'actions.skip_button_only'" value="button" />
                <option v-t="'actions.skip_automatically'" value="auto" />
            </select>
        </label>
        <label class="pref" for="chkShowMarkers">
            <strong v-t="'actions.show_markers'" />
            <input
                id="chkShowMarkers"
                v-model="showMarkers"
                class="checkbox"
                type="checkbox"
                @change="onChange($event)"
            />
        </label>
        <label class="pref" for="txtMinSegmentLength">
            <strong v-t="'actions.min_segment_length'" />
            <input
                id="txtMinSegmentLength"
                v-model="minSegmentLength"
                class="input w-24"
                type="text"
                @change="onChange($event)"
            />
        </label>
    </div>

    <h2 v-t="'titles.dearrow'" class="text-center" />
    <p class="text-center">
        <span v-t="'actions.uses_api_from'" /><a class="link" href="https://sponsor.ajay.app/">sponsor.ajay.app</a>
    </p>
    <label class="pref" for="chkDeArrow">
        <strong v-t="'actions.enable_dearrow'" />
        <input id="chkDeArrow" v-model="dearrow" class="checkbox" type="checkbox" @change="onChange($event)" />
    </label>

    <h2 v-t="'titles.instance'" class="text-center" />
    <p v-t="'actions.instances_not_shown'" class="text-center" />
    <label class="pref" for="ddlInstanceSelection">
        <strong v-text="`${$t('actions.instance_selection')}:`" />
        <select id="ddlInstanceSelection" v-model="selectedInstance" class="select w-auto" @change="onChange($event)">
            <option
                v-for="instance in instances"
                :key="instance.name"
                :value="instance.api_url"
                v-text="instance.name"
            />
        </select>
    </label>
    <label class="pref" for="chkAuthInstance">
        <strong v-text="`${$t('actions.different_auth_instance')}:`" />
        <input
            id="chkAuthInstance"
            v-model="authInstance"
            class="checkbox"
            type="checkbox"
            @change="onChange($event)"
        />
    </label>
    <template v-if="authInstance">
        <label class="pref" for="ddlAuthInstanceSelection">
            <strong v-text="`${$t('actions.instance_auth_selection')}:`" />
            <select
                id="ddlAuthInstanceSelection"
                v-model="selectedAuthInstance"
                class="select w-auto"
                @change="onChange($event)"
            >
                <option
                    v-for="instance in instances"
                    :key="instance.name"
                    :value="instance.api_url"
                    v-text="instance.name"
                />
            </select>
        </label>
    </template>
    <div class="pref">
        <span v-t="'titles.custom_instances'" class="w-max" />
        <button v-t="'actions.customize'" class="btn" @click="showCustomInstancesModal = true" />
    </div>
    <br />

    <!-- options that are visible only when logged in -->
    <div v-if="authenticated">
        <h2 v-t="'titles.account'" class="text-center"></h2>
        <label class="pref" for="txtDeleteAccountPassword">
            <strong v-t="'actions.delete_account'" />
            <div class="flex items-center">
                <input
                    id="txtDeleteAccountPassword"
                    ref="txtDeleteAccountPassword"
                    v-model="password"
                    :placeholder="$t('login.password')"
                    :aria-label="$t('login.password')"
                    class="input mr-2 w-auto"
                    type="password"
                    @keyup.enter="deleteAccount"
                />
                <a v-t="'actions.delete_account'" class="btn w-auto" @click="deleteAccount" />
            </div>
        </label>
        <div class="pref">
            <a v-t="'actions.logout'" class="btn w-auto" @click="logout" />
            <a
                v-t="'actions.invalidate_session'"
                class="btn w-auto"
                style="margin-left: 0.5em"
                @click="invalidateSession"
            />
        </div>
        <br />
    </div>
    <h2 id="instancesList" v-t="'actions.instances_list'" />
    <table class="table">
        <thead>
            <tr>
                <th v-t="'preferences.instance_name'" />
                <th v-t="'preferences.instance_locations'" />
                <th v-t="'preferences.has_cdn'" />
                <th v-t="'preferences.registered_users'" />
                <th v-t="'preferences.version'" class="lt-md:hidden" />
                <th v-t="'preferences.up_to_date'" />
                <th v-t="'preferences.uptime_30d'" />
                <th v-t="'preferences.ssl_score'" />
            </tr>
        </thead>
        <tbody v-for="instance in publicInstances" :key="instance.name">
            <tr>
                <td v-text="instance.name" />
                <td v-text="instance.locations" />
                <td v-text="`${instance.cdn ? '&#9989;' : '&#10060;'}`" />
                <td v-text="instance.registered" />
                <td class="lt-md:hidden" v-text="instance.version" />
                <td v-text="`${instance.up_to_date ? '&#9989;' : '&#10060;'}`" />
                <td v-text="`${Number.parseFloat(instance.uptime_30d.toFixed(2))}%`" />
                <td>
                    <a v-t="'actions.view_ssl_score'" :href="sslScore(instance.api_url)" target="_blank" />
                </td>
            </tr>
        </tbody>
    </table>
    <br />
    <p v-t="'info.preferences_note'" />
    <br />
    <button v-t="'actions.reset_preferences'" class="btn" @click="showConfirmResetPrefsDialog = true" />
    <button v-t="'actions.backup_preferences'" class="btn mx-4" @click="backupPreferences()" />
    <label v-t="'actions.restore_preferences'" for="fileSelector" class="btn" @click="restorePreferences()" />
    <input id="fileSelector" ref="fileSelectorEl" class="hidden" type="file" @change="restorePreferences()" />
    <ConfirmModal
        v-if="showConfirmResetPrefsDialog"
        :message="$t('actions.confirm_reset_preferences')"
        @close="showConfirmResetPrefsDialog = false"
        @confirm="resetPreferences()"
    />
    <CustomInstanceModal
        v-if="showCustomInstancesModal"
        @close="
            showCustomInstancesModal = false;
            fetchInstances();
        "
    />
</template>

<script setup>
import { ref, computed, onMounted, onActivated } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import CountryMapDefault from "@/utils/CountryMaps/en.json";
import ConfirmModal from "./ConfirmModal.vue";
import CustomInstanceModal from "./CustomInstanceModal.vue";
import {
    testLocalStorage,
    getPreferenceString,
    getPreferenceBoolean,
    getPreferenceNumber,
    getPreferenceJSON,
} from "@/composables/usePreferences";
import { fetchJson, apiUrl, authApiUrl, getAuthToken, hashCode, isAuthenticated } from "@/composables/useApi";
import { getCustomInstances } from "@/composables/useCustomInstances";
import { download } from "@/composables/useMisc";
import { getDefaultLanguage } from "@/composables/useFormatting";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const fileSelectorEl = ref(null);

const mobileChapterLayout = ref("Vertical");
const selectedInstance = ref(null);
const authInstance = ref(false);
const selectedAuthInstance = ref(null);
const customInstances = ref([]);
const publicInstances = ref([]);
const sponsorBlock = ref(true);
const skipOptions = ref(
    new Map([
        ["sponsor", { value: "auto", label: "actions.skip_sponsors" }],
        ["intro", { value: "no", label: "actions.skip_intro" }],
        ["outro", { value: "no", label: "actions.skip_outro" }],
        ["preview", { value: "no", label: "actions.skip_preview" }],
        ["interaction", { value: "auto", label: "actions.skip_interaction" }],
        ["selfpromo", { value: "auto", label: "actions.skip_self_promo" }],
        ["music_offtopic", { value: "auto", label: "actions.skip_non_music" }],
        ["poi_highlight", { value: "no", label: "actions.skip_highlight" }],
        ["filler", { value: "no", label: "actions.skip_filler_tangent" }],
    ]),
);
const showMarkers = ref(true);
const minSegmentLength = ref(0);
const dearrow = ref(false);
const selectedTheme = ref("dark");
const autoPlayVideo = ref(true);
const autoDisplayCaptions = ref(false);
const autoPlayNextCountdown = ref(5);
const listen = ref(false);
const resolutions = [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320];
const preferHls = ref(false);
const defaultQuality = ref(0);
const bufferingGoal = ref(10);
const countryMap = ref(CountryMapDefault);
const countrySelected = ref("US");
const defaultHomepage = ref("trending");
const minimizeComments = ref(false);
const minimizeDescription = ref(true);
const minimizeRecommendations = ref(false);
const minimizeChapters = ref(false);
const showWatchOnYouTube = ref(false);
const searchSuggestions = ref(true);
const watchHistory = ref(false);
const searchHistory = ref(false);
const hideWatched = ref(false);
const selectedLanguage = ref("en");
const languages = [
    { code: "ar", name: "Arabic" },
    { code: "az", name: "Azərbaycan" },
    { code: "bg", name: "Български" },
    { code: "bn", name: "বাংলা" },
    { code: "bs", name: "Bosanski" },
    { code: "ca", name: "Català" },
    { code: "cs", name: "Čeština" },
    { code: "da", name: "Dansk" },
    { code: "de", name: "Deutsch" },
    { code: "el", name: "Ελληνικά" },
    { code: "es", name: "Español" },
    { code: "en", name: "English" },
    { code: "eo", name: "Esperanto" },
    { code: "et", name: "Eesti" },
    { code: "fa", name: "فارسی" },
    { code: "fi", name: "Suomi" },
    { code: "fr", name: "Français" },
    { code: "he", name: "עברית" },
    { code: "hi", name: "हिंदी" },
    { code: "id", name: "Indonesia" },
    { code: "is", name: "Íslenska" },
    { code: "kab", name: "Taqbaylit" },
    { code: "hr", name: "Hrvatski" },
    { code: "it", name: "Italiano" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "lt", name: "Lietuvių kalba" },
    { code: "ml", name: "മലയാളം" },
    { code: "nb_NO", name: "Norwegian Bokmål" },
    { code: "nl", name: "Nederlands" },
    { code: "oc", name: "Occitan" },
    { code: "or", name: "ଓଡ଼ିଆ" },
    { code: "pl", name: "Polski" },
    { code: "pt", name: "Português" },
    { code: "pt_PT", name: "Português (Portugal)" },
    { code: "pt_BR", name: "Português (Brasil)" },
    { code: "ro", name: "Română" },
    { code: "ru", name: "Русский" },
    { code: "si", name: "සිංහල" },
    { code: "sl", name: "Slovenian" },
    { code: "sr", name: "Српски" },
    { code: "sv", name: "Svenska" },
    { code: "ta", name: "தமிழ்" },
    { code: "th", name: "ไทย" },
    { code: "tr", name: "Türkçe" },
    { code: "uk", name: "Українська" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "zh_Hant", name: "繁體中文" },
    { code: "zh_Hans", name: "简体中文" },
];
const enabledCodecs = ref(["vp9", "avc"]);
const disableLBRY = ref(false);
const proxyLBRY = ref(false);
const prefetchLimit = ref(2);
const password = ref(null);
const showConfirmResetPrefsDialog = ref(false);
const showCustomInstancesModal = ref(false);

const authenticated = computed(() => isAuthenticated());
const instances = computed(() => [...publicInstances.value, ...customInstances.value]);

onActivated(() => {
    document.title = t("titles.preferences") + " - Piped";
});

onMounted(async () => {
    if (Object.keys(route.query).length > 0) router.replace({ query: {} });

    fetchInstances();

    if (testLocalStorage()) {
        selectedInstance.value = getPreferenceString("instance", import.meta.env.VITE_PIPED_API);
        authInstance.value = getPreferenceBoolean("authInstance", false);
        selectedAuthInstance.value = getPreferenceString("auth_instance_url", selectedInstance.value);

        sponsorBlock.value = getPreferenceBoolean("sponsorblock", true);
        var savedSkipOptions, skipList;
        if ((savedSkipOptions = getPreferenceJSON("skipOptions")) !== undefined) {
            Object.entries(savedSkipOptions).forEach(([key, value]) => {
                var opt = skipOptions.value.get(key);
                if (opt !== undefined) opt.value = value;
                else console.log("Unknown sponsor type: " + key);
            });
        } else if ((skipList = getPreferenceString("selectedSkip")) !== undefined) {
            skipList = skipList.split(",");
            skipOptions.value.forEach(opt => (opt.value = "no"));
            skipList.forEach(skip => {
                var opt = skipOptions.value.get(skip);
                if (opt !== undefined) opt.value = "auto";
                else console.log("Unknown sponsor type: " + skip);
            });
        }

        showMarkers.value = getPreferenceBoolean("showMarkers", true);
        minSegmentLength.value = Math.max(getPreferenceNumber("minSegmentLength", 0), 0);
        dearrow.value = getPreferenceBoolean("dearrow", false);
        selectedTheme.value = getPreferenceString("theme", "dark");
        autoPlayVideo.value = getPreferenceBoolean("playerAutoPlay", true);
        autoDisplayCaptions.value = getPreferenceBoolean("autoDisplayCaptions", false);
        autoPlayNextCountdown.value = getPreferenceNumber("autoPlayNextCountdown", 5);
        listen.value = getPreferenceBoolean("listen", false);
        defaultQuality.value = Number(localStorage.getItem("quality"));
        bufferingGoal.value = Math.max(Number(localStorage.getItem("bufferGoal")), 10);
        countrySelected.value = getPreferenceString("region", "US");
        defaultHomepage.value = getPreferenceString("homepage", "trending");
        minimizeComments.value = getPreferenceBoolean("minimizeComments", false);
        minimizeDescription.value = getPreferenceBoolean("minimizeDescription", true);
        minimizeRecommendations.value = getPreferenceBoolean("minimizeRecommendations", false);
        minimizeChapters.value = getPreferenceBoolean("minimizeChapters", false);
        showWatchOnYouTube.value = getPreferenceBoolean("showWatchOnYouTube", false);
        searchSuggestions.value = getPreferenceBoolean("searchSuggestions", true);
        watchHistory.value = getPreferenceBoolean("watchHistory", false);
        searchHistory.value = getPreferenceBoolean("searchHistory", false);
        selectedLanguage.value = getPreferenceString("hl", await getDefaultLanguage());
        enabledCodecs.value = getPreferenceString("enabledCodecs", "vp9,avc").split(",");
        disableLBRY.value = getPreferenceBoolean("disableLBRY", false);
        proxyLBRY.value = getPreferenceBoolean("proxyLBRY", false);
        prefetchLimit.value = getPreferenceNumber("prefetchLimit", 2);
        hideWatched.value = getPreferenceBoolean("hideWatched", false);
        mobileChapterLayout.value = getPreferenceString("mobileChapterLayout", "Vertical");
        if (selectedLanguage.value != "en") {
            try {
                countryMap.value = await import(`../utils/CountryMaps/${selectedLanguage.value}.json`).then(
                    val => val.default,
                );
            } catch (e) {
                console.error("Countries not translated into " + selectedLanguage.value);
            }
        }
    }
});

async function onChange() {
    if (testLocalStorage()) {
        var shouldReload = false;

        if (
            getPreferenceString("theme", "dark") !== selectedTheme.value ||
            getPreferenceBoolean("watchHistory", false) != watchHistory.value ||
            getPreferenceString("hl", await getDefaultLanguage()) !== selectedLanguage.value ||
            getPreferenceString("enabledCodecs", "vp9,avc") !== enabledCodecs.value.join(",")
        )
            shouldReload = true;

        localStorage.setItem("instance", selectedInstance.value);
        localStorage.setItem("authInstance", authInstance.value);
        localStorage.setItem("auth_instance_url", selectedAuthInstance.value);
        localStorage.setItem("sponsorblock", sponsorBlock.value);

        var savedSkipObj = {};
        skipOptions.value.forEach((v, k) => (savedSkipObj[k] = v.value));
        localStorage.setItem("skipOptions", JSON.stringify(savedSkipObj));

        localStorage.setItem("showMarkers", showMarkers.value);
        localStorage.setItem("minSegmentLength", minSegmentLength.value);

        localStorage.setItem("dearrow", dearrow.value);

        localStorage.setItem("theme", selectedTheme.value);
        localStorage.setItem("playerAutoPlay", autoPlayVideo.value);
        localStorage.setItem("autoDisplayCaptions", autoDisplayCaptions.value);
        localStorage.setItem("autoPlayNextCountdown", autoPlayNextCountdown.value);
        localStorage.setItem("listen", listen.value);
        localStorage.setItem("preferHls", preferHls.value);
        localStorage.setItem("quality", defaultQuality.value);
        localStorage.setItem("bufferGoal", bufferingGoal.value);
        localStorage.setItem("region", countrySelected.value);
        localStorage.setItem("homepage", defaultHomepage.value);
        localStorage.setItem("minimizeComments", minimizeComments.value);
        localStorage.setItem("minimizeDescription", minimizeDescription.value);
        localStorage.setItem("minimizeRecommendations", minimizeRecommendations.value);
        localStorage.setItem("minimizeChapters", minimizeChapters.value);
        localStorage.setItem("showWatchOnYouTube", showWatchOnYouTube.value);
        localStorage.setItem("searchSuggestions", searchSuggestions.value);
        localStorage.setItem("watchHistory", watchHistory.value);
        localStorage.setItem("searchHistory", searchHistory.value);
        if (!searchHistory.value) localStorage.removeItem("search_history");
        localStorage.setItem("hl", selectedLanguage.value);
        localStorage.setItem("enabledCodecs", enabledCodecs.value.join(","));
        localStorage.setItem("disableLBRY", disableLBRY.value);
        localStorage.setItem("proxyLBRY", proxyLBRY.value);
        localStorage.setItem("prefetchLimit", prefetchLimit.value);
        localStorage.setItem("hideWatched", hideWatched.value);
        localStorage.setItem("mobileChapterLayout", mobileChapterLayout.value);

        if (shouldReload) window.location.reload();
    }
}

async function fetchInstances() {
    customInstances.value = getCustomInstances();

    fetchJson(import.meta.env.VITE_PIPED_INSTANCES).then(resp => {
        publicInstances.value = resp;
        if (!publicInstances.value.some(instance => instance.api_url == apiUrl()))
            publicInstances.value.push({
                name: "Selected Instance",
                api_url: apiUrl(),
                locations: "Unknown",
                cdn: false,
                uptime_30d: 100,
            });
    });
}

function sslScore(url) {
    return "https://www.ssllabs.com/ssltest/analyze.html?d=" + new URL(url).host + "&latest";
}

async function deleteAccount() {
    fetchJson(authApiUrl() + "/user/delete", null, {
        method: "POST",
        headers: {
            Authorization: getAuthToken(),
        },
        body: JSON.stringify({
            password: password.value,
        }),
    }).then(resp => {
        if (!resp.error) {
            logout();
        } else alert(resp.error);
    });
}

function logout() {
    localStorage.removeItem("authToken" + hashCode(authApiUrl()));
    window.location = import.meta.env.BASE_URL;
}

function resetPreferences() {
    showConfirmResetPrefsDialog.value = false;
    localStorage.clear();
    window.location = import.meta.env.BASE_URL;
}

async function invalidateSession() {
    fetchJson(authApiUrl() + "/logout", null, {
        method: "POST",
        headers: {
            Authorization: getAuthToken(),
        },
    }).then(resp => {
        if (!resp.error) {
            logout();
        } else alert(resp.error);
    });
}

function backupPreferences() {
    const data = JSON.stringify(localStorage);
    download(data, "preferences.json", "application/json");
}

function restorePreferences() {
    var file = fileSelectorEl.value.files[0];
    file.text().then(text => {
        const data = JSON.parse(text);
        Object.keys(data).forEach(function (key) {
            localStorage.setItem(key, data[key]);
        });
        window.location.reload();
    });
}
</script>

<style>
.pref {
    @apply flex justify-between items-center my-2 mx-[15vw] lt-md:mx-[2vw];
}
.pref:nth-child(odd) {
    @apply bg-gray-200;
}
.dark .pref:nth-child(odd) {
    @apply bg-dark-800;
}
</style>
