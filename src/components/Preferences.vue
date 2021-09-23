<template>
    <div class="uk-flex uk-flex-between uk-flex-middle">
        <button class="uk-button uk-button-text" @click="$router.go(-1) || $router.push('/')">
            <font-awesome-icon icon="chevron-left" /> &nbsp;{{ $t("actions.back") }}
        </button>
        <span><h1 class="uk-text-bold uk-text-center" v-t="'titles.preferences'"/></span>
        <span />
    </div>
    <hr />
    <h2>SponsorBlock</h2>
    <p>{{ $t("actions.uses_api_from") }}<a href="https://sponsor.ajay.app/">sponsor.ajay.app</a></p>
    <label for="chkEnableSponsorblock"><b v-t="'actions.enable_sponsorblock'"/></label>
    <br />
    <input
        id="chkEnableSponsorblock"
        class="uk-checkbox"
        v-model="sponsorBlock"
        @change="onChange($event)"
        type="checkbox"
    />
    <br />
    <label for="chkSkipSponsors"><b v-t="'actions.skip_sponsors'"/></label>
    <br />
    <input id="chkSkipSponsors" class="uk-checkbox" v-model="skipSponsor" @change="onChange($event)" type="checkbox" />
    <br />
    <label for="chkSkipIntro"><b v-t="'actions.skip_intro'"/></label>
    <br />
    <input id="chkSkipIntro" class="uk-checkbox" v-model="skipIntro" @change="onChange($event)" type="checkbox" />
    <br />
    <label for="chkSkipOutro"><b v-t="'actions.skip_outro'"/></label>
    <br />
    <input id="chkSkipOutro" class="uk-checkbox" v-model="skipOutro" @change="onChange($event)" type="checkbox" />
    <br />
    <label for="chkSkipPreview"><b v-t="'actions.skip_preview'"/></label>
    <br />
    <input id="chkSkipPreview" class="uk-checkbox" v-model="skipPreview" @change="onChange($event)" type="checkbox" />
    <br />
    <label for="chkSkipInteraction"><b v-t="'actions.skip_interaction'"/></label>
    <br />
    <input
        id="chkSkipInteraction"
        class="uk-checkbox"
        v-model="skipInteraction"
        @change="onChange($event)"
        type="checkbox"
    />
    <br />
    <label for="chkSkipSelfPromo"><b v-t="'actions.skip_self_promo'"/></label>
    <br />
    <input
        id="chkSkipSelfPromo"
        class="uk-checkbox"
        v-model="skipSelfPromo"
        @change="onChange($event)"
        type="checkbox"
    />
    <br />
    <label for="chkSkipNonMusic"><b v-t="'actions.skip_non_music'"/></label>
    <br />
    <input
        id="chkSkipNonMusic"
        class="uk-checkbox"
        v-model="skipMusicOffTopic"
        @change="onChange($event)"
        type="checkbox"
    />
    <br />
    <label for="ddlTheme"><b v-t="'actions.theme'"/></label>
    <br />
    <select id="ddlTheme" class="uk-select uk-width-auto" v-model="selectedTheme" @change="onChange($event)">
        <option value="auto" v-t="'actions.auto'" />
        <option value="dark" v-t="'actions.dark'" />
        <option value="light" v-t="'actions.light'" />
    </select>
    <br />
    <label for="chkAutoPlayVideo"><b v-t="'actions.autoplay_video'"/></label>
    <br />
    <input
        id="chkAutoPlayVideo"
        class="uk-checkbox"
        v-model="autoPlayVideo"
        @change="onChange($event)"
        type="checkbox"
    />
    <br />
    <label for="chkAudioOnly"><b v-t="'actions.audio_only'"/></label>
    <br />
    <input id="chkAudioOnly" class="uk-checkbox" v-model="listen" @change="onChange($event)" type="checkbox" />
    <br />
    <label for="ddlDefaultQuality"><b v-t="'actions.default_quality'"/></label>
    <br />
    <select id="ddlDefaultQuality" class="uk-select uk-width-auto" v-model="defaultQuality" @change="onChange($event)">
        <option value="0" v-t="'actions.auto'" />
        <option :key="resolution" v-for="resolution in resolutions" :value="resolution">{{ resolution }}p</option>
    </select>
    <br />
    <label for="txtBufferingGoal"><b v-t="'actions.buffering_goal'"/></label>
    <br />
    <input
        id="txtBufferingGoal"
        class="uk-input uk-width-auto"
        v-model="bufferingGoal"
        @change="onChange($event)"
        type="text"
    />
    <br />
    <label for="ddlCountrySelection"><b v-t="'actions.country_selection'"/></label>
    <br />
    <select id="ddlCountrySelection" class="uk-select uk-width-auto" v-model="country" @change="onChange($event)">
        <option :key="country.code" v-for="country in countryMap" :value="country.code">{{ country.name }}</option>
    </select>
    <br />
    <label for="ddlDefaultHomepage"><b v-t="'actions.default_homepage'"/></label>
    <br />
    <select
        id="ddlDefaultHomepage"
        class="uk-select uk-width-auto"
        v-model="defaultHomepage"
        @change="onChange($event)"
    >
        <option value="trending" v-t="'titles.trending'" />
        <option value="feed" v-t="'titles.feed'" />
    </select>
    <br />
    <label for="chkShowComments"><b v-t="'actions.show_comments'"/></label>
    <br />
    <input id="chkShowComments" class="uk-checkbox" v-model="showComments" @change="onChange($event)" type="checkbox" />
    <br />
    <label for="chkMinimizeDescription"><b v-t="'actions.minimize_description_default'"/></label>
    <br />
    <input
        id="chkMinimizeDescription"
        class="uk-checkbox"
        v-model="minimizeDescription"
        @change="onChange($event)"
        type="checkbox"
    />
    <br />
    <label for="chkStoreWatchHistory"><b v-t="'actions.store_watch_history'"/></label>
    <br />
    <input
        id="chkStoreWatchHistory"
        class="uk-checkbox"
        v-model="watchHistory"
        @change="onChange($event)"
        type="checkbox"
    />
    <br />
    <label for="ddlLanguageSelection"><b v-t="'actions.language_selection'"/></label>
    <br />
    <select
        id="ddlLanguageSelection"
        class="uk-select uk-width-auto"
        v-model="selectedLanguage"
        @change="onChange($event)"
    >
        <option :key="language.code" v-for="language in languages" :value="language.code">{{ language.name }}</option>
    </select>
    <br />
    <label for="ddlEnabledCodecs"><b v-t="'actions.enabled_codecs'"/></label>
    <br />
    <select
        id="ddlEnabledCodecs"
        class="uk-select uk-width-auto"
        v-model="enabledCodecs"
        @change="onChange($event)"
        multiple
    >
        <option value="av1">AV1</option>
        <option value="vp9">VP9</option>
        <option value="avc">AVC (h.264)</option>
    </select>
    <br />
    <label for="chkDisableLBRY"><b v-t="'actions.disable_lbry'"/></label>
    <br />
    <input id="chkDisableLBRY" class="uk-checkbox" v-model="disableLBRY" @change="onChange($event)" type="checkbox" />
    <br />
    <label for="chkEnableLBRYProxy"><b v-t="'actions.enable_lbry_proxy'"/></label>
    <br />
    <input id="chkEnableLBRYProxy" class="uk-checkbox" v-model="proxyLBRY" @change="onChange($event)" type="checkbox" />
    <h2 v-t="'actions.instances_list'" />
    <table class="uk-table">
        <thead>
            <tr>
                <th>{{ $t("preferences.instance_name") }}</th>
                <th>{{ $t("preferences.instance_locations") }}</th>
                <th>{{ $t("preferences.has_cdn") }}</th>
                <th>{{ $t("preferences.ssl_score") }}</th>
            </tr>
        </thead>
        <tbody v-bind:key="instance.name" v-for="instance in instances">
            <tr>
                <td>{{ instance.name }}</td>
                <td>{{ instance.locations }}</td>
                <td>{{ instance.cdn == "Yes" ? $t("actions.yes") : $t("actions.no") }}</td>
                <td>
                    <a :href="sslScore(instance.apiurl)" target="_blank"> {{ $t("actions.view_ssl_score") }}</a>
                </td>
            </tr>
        </tbody>
    </table>

    <hr />

    <label for="ddlInstanceSelection"
        ><b>{{ $t("actions.instance_selection") }}:</b></label
    >
    <br />
    <select
        id="ddlInstanceSelection"
        class="uk-select uk-width-auto"
        v-model="selectedInstance"
        @change="onChange($event)"
    >
        <option v-bind:key="instance.name" v-for="instance in instances" v-bind:value="instance.apiurl">
            {{ instance.name }}
        </option>
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
            selectedTheme: "dark",
            autoPlayVideo: true,
            listen: false,
            resolutions: [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320],
            defaultQuality: 0,
            bufferingGoal: 10,
            countryMap: CountryMap,
            country: "US",
            defaultHomepage: "trending",
            showComments: true,
            minimizeDescription: false,
            watchHistory: false,
            selectedLanguage: "en",
            languages: [
                { code: "bn", name: "বাংলা" },
                { code: "de", name: "Deutsch" },
                { code: "el", name: "Ελληνικά" },
                { code: "es", name: "Español" },
                { code: "en", name: "English" },
                { code: "fa", name: "فارسی" },
                { code: "fi", name: "Suomi" },
                { code: "fr", name: "français" },
                { code: "hr", name: "Hrvatski" },
                { code: "it", name: "italiano" },
                { code: "lt", name: "lietuvių kalba" },
                { code: "ml", name: "മലയാളം" },
                { code: "nb_NO", name: "Norwegian Bokmål" },
                { code: "pl", name: "polski" },
                { code: "tr", name: "Türkçe" },
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
                    if (split.length == 4) {
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
                this.skipSponsor = this.skipIntro = this.skipOutro = this.skipPreview = this.skipInteraction = this.skipSelfPromo = this.skipMusicOffTopic = false;
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
            this.country = this.getPreferenceString("region", "US");
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
                    this.CountryMap = await import("@/utils/CountryMaps/" + this.selectedLanguage + ".json").then(
                        val => {
                            this.countryMap = val;
                        },
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
                localStorage.setItem("selectedSkip", sponsorSelected);

                localStorage.setItem("theme", this.selectedTheme);
                localStorage.setItem("playerAutoPlay", this.autoPlayVideo);
                localStorage.setItem("listen", this.listen);
                localStorage.setItem("quality", this.defaultQuality);
                localStorage.setItem("bufferGoal", this.bufferingGoal);
                localStorage.setItem("region", this.country);
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
