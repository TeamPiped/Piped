<template>
    <div class="flex">
        <button @click="$router.go(-1) || $router.push('/')">
            <font-awesome-icon icon="chevron-left" /><span class="ml-1.5" v-text="$t('actions.back')" />
        </button>
    </div>
    <h1 v-t="'titles.preferences'" class="font-bold text-center" />
    <hr />
    <h2>SponsorBlock</h2>
    <p>
        <span v-text="$t('actions.uses_api_from')" /><a class="link" href="https://sponsor.ajay.app/"
            >sponsor.ajay.app</a
        >
    </p>
    <label for="chkEnableSponsorblock"><strong v-t="'actions.enable_sponsorblock'" /></label>
    <br />
    <input
        id="chkEnableSponsorblock"
        v-model="sponsorBlock"
        class="checkbox"
        type="checkbox"
        @change="onChange($event)"
    />
    <br />
    <label for="chkSkipSponsors"><strong v-t="'actions.skip_sponsors'" /></label>
    <br />
    <input id="chkSkipSponsors" v-model="skipSponsor" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkSkipIntro"><strong v-t="'actions.skip_intro'" /></label>
    <br />
    <input id="chkSkipIntro" v-model="skipIntro" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkSkipOutro"><strong v-t="'actions.skip_outro'" /></label>
    <br />
    <input id="chkSkipOutro" v-model="skipOutro" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkSkipPreview"><strong v-t="'actions.skip_preview'" /></label>
    <br />
    <input id="chkSkipPreview" v-model="skipPreview" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkSkipInteraction"><strong v-t="'actions.skip_interaction'" /></label>
    <br />
    <input
        id="chkSkipInteraction"
        v-model="skipInteraction"
        class="checkbox"
        type="checkbox"
        @change="onChange($event)"
    />
    <br />
    <label for="chkSkipSelfPromo"><strong v-t="'actions.skip_self_promo'" /></label>
    <br />
    <input id="chkSkipSelfPromo" v-model="skipSelfPromo" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkSkipNonMusic"><strong v-t="'actions.skip_non_music'" /></label>
    <br />
    <input
        id="chkSkipNonMusic"
        v-model="skipMusicOffTopic"
        class="checkbox"
        type="checkbox"
        @change="onChange($event)"
    />
    <br />
    <label for="chkSkipHighlight"><strong v-t="'actions.skip_highlight'" /></label>
    <br />
    <input id="chkSkipHighlight" v-model="skipHighlight" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkSkipFiller"><strong v-t="'actions.skip_filler_tangent'" /></label>
    <br />
    <input id="chkSkipFiller" v-model="skipFiller" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="ddlTheme"><strong v-t="'actions.theme'" /></label>
    <br />
    <select id="ddlTheme" v-model="selectedTheme" class="select w-auto" @change="onChange($event)">
        <option v-t="'actions.auto'" value="auto" />
        <option v-t="'actions.dark'" value="dark" />
        <option v-t="'actions.light'" value="light" />
    </select>
    <br />
    <label for="chkAutoPlayVideo"><strong v-t="'actions.autoplay_video'" /></label>
    <br />
    <input id="chkAutoPlayVideo" v-model="autoPlayVideo" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkAudioOnly"><strong v-t="'actions.audio_only'" /></label>
    <br />
    <input id="chkAudioOnly" v-model="listen" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="ddlDefaultQuality"><strong v-t="'actions.default_quality'" /></label>
    <br />
    <select id="ddlDefaultQuality" v-model="defaultQuality" class="select w-auto" @change="onChange($event)">
        <option v-t="'actions.auto'" value="0" />
        <option v-for="resolution in resolutions" :key="resolution" :value="resolution" v-text="`${resolution}p`" />
    </select>
    <br />
    <label for="txtBufferingGoal"><strong v-t="'actions.buffering_goal'" /></label>
    <br />
    <input id="txtBufferingGoal" v-model="bufferingGoal" class="input w-auto" type="text" @change="onChange($event)" />
    <br />
    <label for="ddlCountrySelection"><strong v-t="'actions.country_selection'" /></label>
    <br />
    <select id="ddlCountrySelection" v-model="countrySelected" class="select w-auto" @change="onChange($event)">
        <option v-for="country in countryMap" :key="country.code" :value="country.code" v-text="country.name" />
    </select>
    <br />
    <label for="ddlDefaultHomepage"><strong v-t="'actions.default_homepage'" /></label>
    <br />
    <select id="ddlDefaultHomepage" v-model="defaultHomepage" class="select w-auto" @change="onChange($event)">
        <option v-t="'titles.trending'" value="trending" />
        <option v-t="'titles.feed'" value="feed" />
    </select>
    <br />
    <label for="chkShowComments"><strong v-t="'actions.show_comments'" /></label>
    <br />
    <input id="chkShowComments" v-model="showComments" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkMinimizeDescription"><strong v-t="'actions.minimize_description_default'" /></label>
    <br />
    <input
        id="chkMinimizeDescription"
        v-model="minimizeDescription"
        class="checkbox"
        type="checkbox"
        @change="onChange($event)"
    />
    <br />
    <label for="chkStoreWatchHistory"><strong v-t="'actions.store_watch_history'" /></label>
    <br />
    <input
        id="chkStoreWatchHistory"
        v-model="watchHistory"
        class="checkbox"
        type="checkbox"
        @change="onChange($event)"
    />
    <br />
    <label for="ddlLanguageSelection"><strong v-t="'actions.language_selection'" /></label>
    <br />
    <select id="ddlLanguageSelection" v-model="selectedLanguage" class="select w-auto" @change="onChange($event)">
        <option v-for="language in languages" :key="language.code" :value="language.code" v-text="language.name" />
    </select>
    <br />
    <label for="ddlEnabledCodecs"><strong v-t="'actions.enabled_codecs'" /></label>
    <br />
    <select id="ddlEnabledCodecs" v-model="enabledCodecs" class="select w-auto" multiple @change="onChange($event)">
        <option value="av1">AV1</option>
        <option value="vp9">VP9</option>
        <option value="avc">AVC (h.264)</option>
    </select>
    <br />
    <label for="chkDisableLBRY"><strong v-t="'actions.disable_lbry'" /></label>
    <br />
    <input id="chkDisableLBRY" v-model="disableLBRY" class="checkbox" type="checkbox" @change="onChange($event)" />
    <br />
    <label for="chkEnableLBRYProxy"><strong v-t="'actions.enable_lbry_proxy'" /></label>
    <br />
    <input id="chkEnableLBRYProxy" v-model="proxyLBRY" class="checkbox" type="checkbox" @change="onChange($event)" />
    <h2 v-t="'actions.instances_list'" />
    <table class="table">
        <thead>
            <tr>
                <th v-text="$t('preferences.instance_name')" />
                <th v-text="$t('preferences.instance_locations')" />
                <th v-text="$t('preferences.has_cdn')" />
                <th v-text="$t('preferences.ssl_score')" />
            </tr>
        </thead>
        <tbody v-for="instance in instances" :key="instance.name">
            <tr>
                <td v-text="instance.name" />
                <td v-text="instance.locations" />
                <td v-text="$t(`actions.${instance.cdn === 'Yes' ? 'yes' : 'no'}`)" />
                <td>
                    <a :href="sslScore(instance.apiurl)" target="_blank" v-text="$t('actions.view_ssl_score')" />
                </td>
            </tr>
        </tbody>
    </table>

    <hr />

    <label for="ddlInstanceSelection"><strong v-text="`${$t('actions.instance_selection')}:`" /></label>
    <br />
    <select id="ddlInstanceSelection" v-model="selectedInstance" class="select w-auto" @change="onChange($event)">
        <option v-for="instance in instances" :key="instance.name" :value="instance.apiurl" v-text="instance.name" />
    </select>
</template>

<script>
import CountryMap from "@/utils/CountryMaps/en.json";
export default {
    data() {
        return {
            selectedInstance: null,
            instances: [],
            sponsorBlock: true,
            skipSponsor: true,
            skipIntro: false,
            skipOutro: false,
            skipPreview: false,
            skipInteraction: true,
            skipSelfPromo: true,
            skipMusicOffTopic: true,
            skipHighlight: false,
            skipFiller: false,
            selectedTheme: "dark",
            autoPlayVideo: true,
            listen: false,
            resolutions: [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320],
            defaultQuality: 0,
            bufferingGoal: 10,
            countryMap: CountryMap,
            countrySelected: "US",
            defaultHomepage: "trending",
            showComments: true,
            minimizeDescription: false,
            watchHistory: false,
            selectedLanguage: "en",
            languages: [
                { code: "bn", name: "বাংলা" },
                { code: "cs", name: "Čeština" },
                { code: "de", name: "Deutsch" },
                { code: "el", name: "Ελληνικά" },
                { code: "es", name: "Español" },
                { code: "en", name: "English" },
                { code: "fa", name: "فارسی" },
                { code: "fi", name: "Suomi" },
                { code: "fr", name: "français" },
                { code: "hi", name: "हिंदी" },
                { code: "id", name: "Indonesia" },
                { code: "is", name: "Íslenska" },
                { code: "hr", name: "Hrvatski" },
                { code: "it", name: "italiano" },
                { code: "ja", name: "日本語" },
                { code: "ko", name: "한국어" },
                { code: "lt", name: "lietuvių kalba" },
                { code: "ml", name: "മലയാളം" },
                { code: "nb_NO", name: "Norwegian Bokmål" },
                { code: "pl", name: "polski" },
                { code: "pt", name: "Português" },
                { code: "ru", name: "русский" },
                { code: "sr", name: "Српски" },
                { code: "sv", name: "svenska" },
                { code: "ta", name: "தமிழ்" },
                { code: "tr", name: "Türkçe" },
                { code: "uk", name: "українська" },
                { code: "zh_Hant", name: "繁體中文" },
                { code: "zh_Hans", name: "简体中文" },
            ],
            enabledCodecs: ["av1", "vp9", "avc"],
            disableLBRY: false,
            proxyLBRY: false,
        };
    },
    activated() {
        document.title = this.$t("titles.preferences") + " - Piped";
    },
    async mounted() {
        if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} });

        fetch("https://raw.githubusercontent.com/wiki/TeamPiped/Piped-Frontend/Instances.md")
            .then(resp => resp.text())
            .then(body => {
                var skipped = 0;
                const lines = body.split("\n");
                lines.map(line => {
                    const split = line.split("|");
                    if (split.length == 5) {
                        if (skipped < 2) {
                            skipped++;
                            return;
                        }
                        this.instances.push({
                            name: split[0].trim(),
                            apiurl: split[1].trim(),
                            locations: split[2].trim(),
                            cdn: split[3].trim(),
                        });
                    }
                });
                if (this.instances.filter(instance => instance.apiurl == this.apiUrl()).length == 0)
                    this.instances.push({
                        name: "Custom Instance",
                        apiurl: this.apiUrl(),
                        locations: "Unknown",
                        cdn: "Unknown",
                    });
            });

        if (this.testLocalStorage) {
            this.selectedInstance = this.getPreferenceString("instance", "https://pipedapi.kavin.rocks");

            this.sponsorBlock = this.getPreferenceBoolean("sponsorblock", true);
            if (localStorage.getItem("selectedSkip") !== null) {
                var skipList = localStorage.getItem("selectedSkip").split(",");
                this.skipSponsor =
                    this.skipIntro =
                    this.skipOutro =
                    this.skipPreview =
                    this.skipInteraction =
                    this.skipSelfPromo =
                    this.skipMusicOffTopic =
                    this.skipHighlight =
                    this.skipFiller =
                        false;
                skipList.forEach(skip => {
                    switch (skip) {
                        case "sponsor":
                            this.skipSponsor = true;
                            break;
                        case "intro":
                            this.skipIntro = true;
                            break;
                        case "outro":
                            this.skipOutro = true;
                            break;
                        case "preview":
                            this.skipPreview = true;
                            break;
                        case "interaction":
                            this.skipInteraction = true;
                            break;
                        case "selfpromo":
                            this.skipSelfPromo = true;
                            break;
                        case "music_offtopic":
                            this.skipMusicOffTopic = true;
                            break;
                        case "poi_highlight":
                            this.skipHighlight = true;
                            break;
                        case "filler":
                            this.skipFiller = true;
                            break;
                        default:
                            console.log("Unknown sponsor type: " + skip);
                            break;
                    }
                });
            }

            this.selectedTheme = this.getPreferenceString("theme", "dark");
            this.autoPlayVideo = this.getPreferenceBoolean("playerAutoPlay", true);
            this.listen = this.getPreferenceBoolean("listen", false);
            this.defaultQuality = Number(localStorage.getItem("quality"));
            this.bufferingGoal = Math.max(Number(localStorage.getItem("bufferGoal")), 10);
            this.countrySelected = this.getPreferenceString("region", "US");
            this.defaultHomepage = this.getPreferenceString("homepage", "trending");
            this.showComments = this.getPreferenceBoolean("comments", true);
            this.minimizeDescription = this.getPreferenceBoolean("minimizeDescription", false);
            this.watchHistory = this.getPreferenceBoolean("watchHistory", false);
            this.selectedLanguage = this.getPreferenceString("hl", this.defaultLangage);
            this.enabledCodecs = this.getPreferenceString("enabledCodecs", "av1,vp9,avc").split(",");
            this.disableLBRY = this.getPreferenceBoolean("disableLBRY", false);
            this.proxyLBRY = this.getPreferenceBoolean("proxyLBRY", false);
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
        onChange() {
            if (this.testLocalStorage) {
                var shouldReload = false;

                if (
                    this.getPreferenceString("theme", "dark") !== this.selectedTheme ||
                    this.getPreferenceBoolean("watchHistory", false) != this.watchHistory ||
                    this.getPreferenceString("hl", this.defaultLangage) !== this.selectedLanguage ||
                    this.getPreferenceString("enabledCodecs", "av1,vp9,avc") !== this.enabledCodecs.join(",")
                )
                    shouldReload = true;

                localStorage.setItem("instance", this.selectedInstance);
                localStorage.setItem("sponsorblock", this.sponsorBlock);

                var sponsorSelected = [];
                if (this.skipSponsor) sponsorSelected.push("sponsor");
                if (this.skipIntro) sponsorSelected.push("intro");
                if (this.skipOutro) sponsorSelected.push("outro");
                if (this.skipPreview) sponsorSelected.push("preview");
                if (this.skipInteraction) sponsorSelected.push("interaction");
                if (this.skipSelfPromo) sponsorSelected.push("selfpromo");
                if (this.skipMusicOffTopic) sponsorSelected.push("music_offtopic");
                if (this.skipHighlight) sponsorSelected.push("poi_highlight");
                if (this.skipFiller) sponsorSelected.push("filler");
                localStorage.setItem("selectedSkip", sponsorSelected);

                localStorage.setItem("theme", this.selectedTheme);
                localStorage.setItem("playerAutoPlay", this.autoPlayVideo);
                localStorage.setItem("listen", this.listen);
                localStorage.setItem("quality", this.defaultQuality);
                localStorage.setItem("bufferGoal", this.bufferingGoal);
                localStorage.setItem("region", this.countrySelected);
                localStorage.setItem("homepage", this.defaultHomepage);
                localStorage.setItem("comments", this.showComments);
                localStorage.setItem("minimizeDescription", this.minimizeDescription);
                localStorage.setItem("watchHistory", this.watchHistory);
                localStorage.setItem("hl", this.selectedLanguage);
                localStorage.setItem("enabledCodecs", this.enabledCodecs.join(","));
                localStorage.setItem("disableLBRY", this.disableLBRY);
                localStorage.setItem("proxyLBRY", this.proxyLBRY);

                if (shouldReload) window.location.reload();
            }
        },
        sslScore(url) {
            return "https://www.ssllabs.com/ssltest/analyze.html?d=" + new URL(url).host + "&latest";
        },
    },
};
</script>
