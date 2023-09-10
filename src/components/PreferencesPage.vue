<template>
    <div class="pp-pref-cards">
        <div efy_card="grid">
            <h5>Quick</h5>
            <label class="pref" for="ddlLanguageSelection">
                <strong v-t="'actions.language_selection'" />
                <select
                    id="ddlLanguageSelection"
                    v-model="selectedLanguage"
                    class="select w-auto"
                    @change="onChange($event)"
                >
                    <option
                        v-for="language in languages"
                        :key="language.code"
                        :value="language.code"
                        v-text="language.name"
                    />
                </select>
            </label>
            <label class="pref" for="ddlCountrySelection">
                <strong v-t="'actions.country_selection'" />
                <select id="ddlCountrySelection" v-model="countrySelected" class="select" @change="onChange($event)">
                    <option
                        v-for="country in countryMap"
                        :key="country.code"
                        :value="country.code"
                        v-text="country.name"
                    />
                </select>
            </label>
            <label class="pref" for="ddlDefaultHomepage">
                <strong v-t="'actions.default_homepage'" />
                <select
                    id="ddlDefaultHomepage"
                    v-model="defaultHomepage"
                    class="select w-auto"
                    @change="onChange($event)"
                >
                    <option v-t="'titles.trending'" value="trending" />
                    <option v-t="'titles.feed'" value="feed" />
                </select>
            </label>
            <label class="pref" for="ddlInstanceSelection">
                <strong v-text="`${$t('actions.instance_selection')}:`" />
                <select
                    id="ddlInstanceSelection"
                    v-model="selectedInstance"
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

            <div class="pref items-start! flex-col">
                <strong>Preferences</strong>
                <div class="flex flex-wrap" style="gap: var(--efy_gap0)">
                    <button style="height: var(--efy_ratio_width)" @click="showConfirmResetPrefsDialog = true">
                        Reset
                    </button>
                    <button style="height: var(--efy_ratio_width)" @click="backupPreferences()">Backup</button>
                    <label for="fileSelector" class="btn text-center" role="button" @click="restorePreferences()">
                        Restore
                    </label>
                    <input
                        id="fileSelector"
                        ref="fileSelector"
                        class="hidden"
                        type="file"
                        @change="restorePreferences()"
                    />
                </div>
                <p v-t="'info.preferences_note'" />
                <ConfirmModal
                    v-if="showConfirmResetPrefsDialog"
                    :message="$t('actions.confirm_reset_preferences')"
                    @close="showConfirmResetPrefsDialog = false"
                    @confirm="resetPreferences()"
                />
            </div>
            <!-- options that are visible only when logged in -->
            <div v-if="authenticated" class="pref items-start! flex-col">
                <label v-t="'actions.delete_account'" for="txtDeleteAccountPassword" class="font-bold" />
                <div class="flex flex-wrap" style="gap: var(--efy_gap0)">
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
                    <button v-t="'actions.delete_account'" class="w-auto" @click="deleteAccount" />
                </div>
            </div>
            <div v-if="authenticated" class="pref items-start! flex-col" style="border-bottom: var(--efy_border)">
                <strong>Logout</strong>
                <div class="flex flex-wrap" style="gap: var(--efy_gap0)">
                    <button v-t="'actions.logout'" class="w-auto" @click="logout" />
                    <button v-t="'actions.invalidate_session'" class="w-auto" @click="invalidateSession" />
                </div>
            </div>
        </div>
        <div efy_card="grid">
            <h5 v-t="'titles.player'" />
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
            <label class="pref" for="ddlDefaultQuality">
                <strong v-t="'actions.default_quality'" />
                <select
                    id="ddlDefaultQuality"
                    v-model="defaultQuality"
                    class="select w-auto"
                    @change="onChange($event)"
                >
                    <option v-t="'actions.auto'" value="0" />
                    <option
                        v-for="resolution in resolutions"
                        :key="resolution"
                        :value="resolution"
                        v-text="`${resolution}p`"
                    />
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
            <label class="pref" for="chkMinimizeChapters">
                <strong v-t="'actions.chapters_layout_mobile'" />

                <select
                    id="ddlDefaultHomepage"
                    v-model="mobileChapterLayout"
                    class="select w-auto"
                    @change="onChange($event)"
                >
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
                <input
                    id="chkHideWatched"
                    v-model="hideWatched"
                    class="checkbox"
                    type="checkbox"
                    @change="onChange($event)"
                />
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
                <input
                    id="chkDisableLBRY"
                    v-model="disableLBRY"
                    class="checkbox"
                    type="checkbox"
                    @change="onChange($event)"
                />
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
        </div>

        <div efy_card="grid">
            <h5>SponsorBlock + DeArrow</h5>
            <p class="pref" style="justify-content: unset !important">
                <span v-t="'actions.uses_api_from'" /><a class="link" href="https://sponsor.ajay.app/"
                    >sponsor.ajay.app</a
                >
            </p>
            <label class="pref" for="chkDeArrow">
                <strong v-t="'actions.enable_dearrow'" />
                <input id="chkDeArrow" v-model="dearrow" class="checkbox" type="checkbox" @change="onChange($event)" />
            </label>
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
                    <select
                        :id="'ddlSkip_' + name"
                        v-model="item.value"
                        class="select w-auto"
                        @change="onChange($event)"
                    >
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
                <label class="pref" for="txtMinSegmentLength" style="border-bottom: var(--efy_border)">
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
        </div>
    </div>

    <h2 id="instancesList" v-t="'actions.instances_list'" />
    <table>
        <thead>
            <tr>
                <th v-t="'preferences.instance_name'" />
                <th v-t="'preferences.instance_locations'" />
                <th v-t="'preferences.has_cdn'" />
                <th v-t="'preferences.registered_users'" />
                <th v-t="'preferences.version'" class="lt-md:hidden" />
                <th v-t="'preferences.up_to_date'" />
                <th v-t="'preferences.ssl_score'" />
            </tr>
        </thead>
        <tbody v-for="instance in instances" :key="instance.name">
            <tr>
                <td v-text="instance.name" />
                <td v-text="instance.locations" />
                <td v-text="`${instance.cdn ? '&#9989;' : '&#10060;'}`" />
                <td v-text="instance.registered" />
                <td class="lt-md:hidden" v-text="instance.version" />
                <td v-text="`${instance.up_to_date ? '&#9989;' : '&#10060;'}`" />
                <td>
                    <a v-t="'actions.view_ssl_score'" :href="sslScore(instance.api_url)" target="_blank" />
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script>
import CountryMap from "@/utils/CountryMaps/en.json";
import ConfirmModal from "./ConfirmModal.vue";
export default {
    components: {
        ConfirmModal,
    },
    data() {
        return {
            mobileChapterLayout: "Vertical",
            selectedInstance: null,
            authInstance: false,
            selectedAuthInstance: null,
            instances: [],
            sponsorBlock: true,
            skipOptions: new Map([
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
            showMarkers: true,
            minSegmentLength: 0,
            dearrow: false,
            selectedTheme: "dark",
            autoPlayVideo: true,
            autoDisplayCaptions: false,
            autoPlayNextCountdown: 5,
            listen: false,
            resolutions: [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320],
            defaultQuality: 0,
            bufferingGoal: 10,
            countryMap: CountryMap,
            countrySelected: "US",
            defaultHomepage: "trending",
            minimizeComments: false,
            minimizeDescription: false,
            minimizeRecommendations: false,
            minimizeChapters: false,
            showWatchOnYouTube: false,
            searchSuggestions: true,
            watchHistory: false,
            searchHistory: false,
            hideWatched: false,
            selectedLanguage: "en",
            languages: [
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
                { code: "sr", name: "Српски" },
                { code: "sv", name: "Svenska" },
                { code: "ta", name: "தமிழ்" },
                { code: "th", name: "ไทย" },
                { code: "tr", name: "Türkçe" },
                { code: "uk", name: "Українська" },
                { code: "vi", name: "Tiếng Việt" },
                { code: "zh_Hant", name: "繁體中文" },
                { code: "zh_Hans", name: "简体中文" },
            ],
            enabledCodecs: ["vp9", "avc"],
            disableLBRY: false,
            proxyLBRY: false,
            password: null,
            showConfirmResetPrefsDialog: false,
        };
    },
    activated() {
        document.title = this.$t("titles.preferences") + " - Piped";
    },
    async mounted() {
        if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} });

        this.fetchJson("https://piped-instances.kavin.rocks/").then(resp => {
            this.instances = resp;
            if (!this.instances.some(instance => instance.api_url == this.apiUrl()))
                this.instances.push({
                    name: "Custom Instance",
                    api_url: this.apiUrl(),
                    locations: "Unknown",
                    cdn: false,
                });
        });

        if (this.testLocalStorage) {
            this.selectedInstance = this.getPreferenceString("instance", "https://pipedapi.kavin.rocks");
            this.authInstance = this.getPreferenceBoolean("authInstance", false);
            this.selectedAuthInstance = this.getPreferenceString("auth_instance_url", this.selectedInstance);

            this.sponsorBlock = this.getPreferenceBoolean("sponsorblock", true);
            var skipOptions, skipList;
            if ((skipOptions = this.getPreferenceJSON("skipOptions")) !== undefined) {
                Object.entries(skipOptions).forEach(([key, value]) => {
                    var opt = this.skipOptions.get(key);
                    if (opt !== undefined) opt.value = value;
                    else console.log("Unknown sponsor type: " + key);
                });
            } else if ((skipList = this.getPreferenceString("selectedSkip")) !== undefined) {
                skipList = skipList.split(",");
                this.skipOptions.forEach(opt => (opt.value = "no"));
                skipList.forEach(skip => {
                    var opt = this.skipOptions.get(skip);
                    if (opt !== undefined) opt.value = "auto";
                    else console.log("Unknown sponsor type: " + skip);
                });
            }

            this.showMarkers = this.getPreferenceBoolean("showMarkers", true);
            this.minSegmentLength = Math.max(this.getPreferenceNumber("minSegmentLength", 0), 0);
            this.dearrow = this.getPreferenceBoolean("dearrow", false);
            this.selectedTheme = this.getPreferenceString("theme", "dark");
            this.autoPlayVideo = this.getPreferenceBoolean("playerAutoPlay", true);
            this.autoDisplayCaptions = this.getPreferenceBoolean("autoDisplayCaptions", false);
            this.autoPlayNextCountdown = this.getPreferenceNumber("autoPlayNextCountdown", 5);
            this.listen = this.getPreferenceBoolean("listen", false);
            this.defaultQuality = Number(localStorage.getItem("quality"));
            this.bufferingGoal = Math.max(Number(localStorage.getItem("bufferGoal")), 10);
            this.countrySelected = this.getPreferenceString("region", "US");
            this.defaultHomepage = this.getPreferenceString("homepage", "trending");
            this.minimizeComments = this.getPreferenceBoolean("minimizeComments", false);
            this.minimizeDescription = this.getPreferenceBoolean("minimizeDescription", false);
            this.minimizeRecommendations = this.getPreferenceBoolean("minimizeRecommendations", false);
            this.minimizeChapters = this.getPreferenceBoolean("minimizeChapters", false);
            this.showWatchOnYouTube = this.getPreferenceBoolean("showWatchOnYouTube", false);
            this.searchSuggestions = this.getPreferenceBoolean("searchSuggestions", true);
            this.watchHistory = this.getPreferenceBoolean("watchHistory", false);
            this.searchHistory = this.getPreferenceBoolean("searchHistory", false);
            this.selectedLanguage = this.getPreferenceString("hl", await this.defaultLanguage);
            this.enabledCodecs = this.getPreferenceString("enabledCodecs", "vp9,avc").split(",");
            this.disableLBRY = this.getPreferenceBoolean("disableLBRY", false);
            this.proxyLBRY = this.getPreferenceBoolean("proxyLBRY", false);
            this.hideWatched = this.getPreferenceBoolean("hideWatched", false);
            this.mobileChapterLayout = this.getPreferenceString("mobileChapterLayout", "Vertical");
            if (this.selectedLanguage != "en") {
                try {
                    this.CountryMap = await import(`../utils/CountryMaps/${this.selectedLanguage}.json`).then(
                        val => val.default,
                    );
                } catch (e) {
                    console.error("Countries not translated into " + this.selectedLanguage);
                }
            }
        }
    },
    methods: {
        async onChange() {
            if (this.testLocalStorage) {
                var shouldReload = false;

                if (
                    this.getPreferenceString("theme", "dark") !== this.selectedTheme ||
                    this.getPreferenceBoolean("watchHistory", false) != this.watchHistory ||
                    this.getPreferenceString("hl", await this.defaultLanguage) !== this.selectedLanguage ||
                    this.getPreferenceString("enabledCodecs", "vp9,avc") !== this.enabledCodecs.join(",")
                )
                    shouldReload = true;

                localStorage.setItem("instance", this.selectedInstance);
                localStorage.setItem("authInstance", this.authInstance);
                localStorage.setItem("auth_instance_url", this.selectedAuthInstance);
                localStorage.setItem("sponsorblock", this.sponsorBlock);

                var skipOptions = {};
                this.skipOptions.forEach((v, k) => (skipOptions[k] = v.value));
                localStorage.setItem("skipOptions", JSON.stringify(skipOptions));

                localStorage.setItem("showMarkers", this.showMarkers);
                localStorage.setItem("minSegmentLength", this.minSegmentLength);

                localStorage.setItem("dearrow", this.dearrow);

                localStorage.setItem("theme", this.selectedTheme);
                localStorage.setItem("playerAutoPlay", this.autoPlayVideo);
                localStorage.setItem("autoDisplayCaptions", this.autoDisplayCaptions);
                localStorage.setItem("autoPlayNextCountdown", this.autoPlayNextCountdown);
                localStorage.setItem("listen", this.listen);
                localStorage.setItem("quality", this.defaultQuality);
                localStorage.setItem("bufferGoal", this.bufferingGoal);
                localStorage.setItem("region", this.countrySelected);
                localStorage.setItem("homepage", this.defaultHomepage);
                localStorage.setItem("minimizeComments", this.minimizeComments);
                localStorage.setItem("minimizeDescription", this.minimizeDescription);
                localStorage.setItem("minimizeRecommendations", this.minimizeRecommendations);
                localStorage.setItem("minimizeChapters", this.minimizeChapters);
                localStorage.setItem("showWatchOnYouTube", this.showWatchOnYouTube);
                localStorage.setItem("searchSuggestions", this.searchSuggestions);
                localStorage.setItem("watchHistory", this.watchHistory);
                localStorage.setItem("searchHistory", this.searchHistory);
                if (!this.searchHistory) localStorage.removeItem("search_history");
                localStorage.setItem("hl", this.selectedLanguage);
                localStorage.setItem("enabledCodecs", this.enabledCodecs.join(","));
                localStorage.setItem("disableLBRY", this.disableLBRY);
                localStorage.setItem("proxyLBRY", this.proxyLBRY);
                localStorage.setItem("hideWatched", this.hideWatched);
                localStorage.setItem("mobileChapterLayout", this.mobileChapterLayout);

                if (shouldReload) window.location.reload();
            }
        },
        sslScore(url) {
            return "https://www.ssllabs.com/ssltest/analyze.html?d=" + new URL(url).host + "&latest";
        },
        async deleteAccount() {
            this.fetchJson(this.authApiUrl() + "/user/delete", null, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthToken(),
                },
                body: JSON.stringify({
                    password: this.password,
                }),
            }).then(resp => {
                if (!resp.error) {
                    this.logout();
                } else alert(resp.error);
            });
        },
        logout() {
            // reset the auth token
            localStorage.removeItem("authToken" + this.hashCode(this.authApiUrl()));
            // redirect to trending page
            window.location = "/";
        },
        resetPreferences() {
            this.showConfirmResetPrefsDialog = false;
            // clear the local storage
            localStorage.clear();
            // redirect to the home page
            window.location = "/";
        },
        async invalidateSession() {
            this.fetchJson(this.authApiUrl() + "/logout", null, {
                method: "POST",
                headers: {
                    Authorization: this.getAuthToken(),
                },
            }).then(resp => {
                if (!resp.error) {
                    this.logout();
                } else alert(resp.error);
            });
        },
        backupPreferences() {
            const data = JSON.stringify(localStorage);
            this.download(data, "preferences.json", "application/json");
        },
        restorePreferences() {
            var file = this.$refs.fileSelector.files[0];
            file.text().then(text => {
                const data = JSON.parse(text);
                Object.keys(data).forEach(function (key) {
                    localStorage.setItem(key, data[key]);
                });
                window.location.reload();
            });
        },
    },
};
</script>

<style>
.pref {
    @apply flex justify-between items-center;
    padding: 10rem;
    border-top: var(--efy_border);
    gap: 10rem;
}
/*.pref:nth-child(odd) {
    background: var(--efy_bg1);
}*/
.pref :is(input, select, button, [role="button"]) {
    margin: 0;
}
.pref strong {
    line-height: 1;
}
.pref :is([type="number"], [type="text"], select) {
    min-width: 60rem;
    max-width: 250rem;
}
.pp-pref-cards {
    margin-top: 15rem;
}
[efy_card*="grid"] {
    padding: 0;
    gap: 0;
}
[efy_card*="grid"]:active {
    transform: scale(1) !important;
}
[efy_card*="grid"] h5 {
    padding: 5rem 10rem;
}
tbody:nth-child(odd) {
    background: var(--efy_bg1) !important;
}
</style>
