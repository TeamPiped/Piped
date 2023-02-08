<template>
    <div class="flex">
        <button @click="$router.go(-1) || $router.push('/')">
            <font-awesome-icon icon="chevron-left" /><span class="ml-1.5" v-t="'actions.back'" />
        </button>
    </div>
    <h1 v-t="'titles.preferences'" class="font-bold text-center" />
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

    <h2 class="text-center" v-t="'titles.player'" />
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
    <label class="pref" for="chkAudioOnly">
        <strong v-t="'actions.audio_only'" />
        <input id="chkAudioOnly" v-model="listen" class="checkbox" type="checkbox" @change="onChange($event)" />
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
            class="select w-auto h-auto"
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
        <label v-for="[name, item] in skipOptions" class="pref" :for="'ddlSkip_' + name" :key="name">
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
    <h2 class="text-center" v-t="'titles.instance'" />
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
    <br />

    <!-- options that are visible only when logged in -->
    <div v-if="this.authenticated">
        <h2 class="text-center" v-t="'titles.account'"></h2>
        <label class="pref" for="txtDeleteAccountPassword">
            <strong v-t="'actions.delete_account'" />
            <div class="flex items-center">
                <input
                    id="txtDeleteAccountPassword"
                    ref="txtDeleteAccountPassword"
                    v-model="password"
                    v-on:keyup.enter="deleteAccount"
                    :placeholder="$t('login.password')"
                    :aria-label="$t('login.password')"
                    class="input w-auto mr-2"
                    type="password"
                />
                <a class="btn w-auto" @click="deleteAccount" v-t="'actions.delete_account'" />
            </div>
        </label>
        <div class="pref">
            <a class="btn w-auto" @click="logout" v-t="'actions.logout'" />
            <a
                class="btn w-auto"
                style="margin-left: 0.5em"
                @click="invalidateSession"
                v-t="'actions.invalidate_session'"
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
                <th class="lt-md:hidden" v-t="'preferences.version'" />
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
                    <a :href="sslScore(instance.api_url)" target="_blank" v-t="'actions.view_ssl_score'" />
                </td>
            </tr>
        </tbody>
    </table>
    <br />
    <p v-t="'info.preferences_note'" />
    <br />
    <button class="btn" v-t="'actions.reset_preferences'" @click="resetPreferences()" />
    <button class="btn mx-4" v-t="'actions.backup_preferences'" @click="backupPreferences()" />
    <label for="fileSelector" class="btn" v-t="'actions.restore_preferences'" @click="restorePreferences()" />
    <input class="hidden" id="fileSelector" ref="fileSelector" type="file" @change="restorePreferences()" />
</template>

<script>
import CountryMap from "@/utils/CountryMaps/en.json";
export default {
    data() {
        return {
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
            selectedTheme: "dark",
            autoPlayVideo: true,
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
            watchHistory: false,
            searchHistory: false,
            hideWatched: false,
            selectedLanguage: "en",
            languages: [
                { code: "ar", name: "Arabic" },
                { code: "az", name: "Azərbaycan" },
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
        };
    },
    activated() {
        document.title = this.$t("titles.preferences") + " - Piped";
    },
    async mounted() {
        if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} });

        this.fetchJson("https://piped-instances.kavin.rocks/").then(resp => {
            this.instances = resp;
            if (this.instances.filter(instance => instance.api_url == this.apiUrl()).length == 0)
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
            this.selectedTheme = this.getPreferenceString("theme", "dark");
            this.autoPlayVideo = this.getPreferenceBoolean("playerAutoPlay", true);
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
            this.watchHistory = this.getPreferenceBoolean("watchHistory", false);
            this.searchHistory = this.getPreferenceBoolean("searchHistory", false);
            this.selectedLanguage = this.getPreferenceString("hl", await this.defaultLanguage);
            this.enabledCodecs = this.getPreferenceString("enabledCodecs", "vp9,avc").split(",");
            this.disableLBRY = this.getPreferenceBoolean("disableLBRY", false);
            this.proxyLBRY = this.getPreferenceBoolean("proxyLBRY", false);
            this.hideWatched = this.getPreferenceBoolean("hideWatched", false);
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
                localStorage.setItem("theme", this.selectedTheme);
                localStorage.setItem("playerAutoPlay", this.autoPlayVideo);
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
                localStorage.setItem("watchHistory", this.watchHistory);
                localStorage.setItem("searchHistory", this.searchHistory);
                if (!this.searchHistory) localStorage.removeItem("search_history");
                localStorage.setItem("hl", this.selectedLanguage);
                localStorage.setItem("enabledCodecs", this.enabledCodecs.join(","));
                localStorage.setItem("disableLBRY", this.disableLBRY);
                localStorage.setItem("proxyLBRY", this.proxyLBRY);
                localStorage.setItem("hideWatched", this.hideWatched);

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
            if (!confirm(this.$t("actions.confirm_reset_preferences"))) return;
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
    @apply flex justify-between items-center my-2 mx-[15vw] lt-md:mx-[2vw];
}
</style>
