<template>
    <div class="flex">
        <button
            class="inline-flex items-center gap-1 rounded-sm bg-gray-300 px-3 py-2 text-gray-700 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-300 dark:hover:bg-dark-300"
            @click="$router.go(-1) || $router.push('/')"
        >
            <i-fa6-solid-chevron-left class="shrink-0" /><span v-t="'actions.back'" />
        </button>
    </div>
    <h1 v-t="'titles.preferences'" class="text-center font-bold" />
    <hr />
    <label
        for="ddlTheme"
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
    >
        <strong v-t="'actions.theme'" />
        <select
            id="ddlTheme"
            v-model="selectedTheme"
            class="h-8 w-auto bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
            @change="onChange($event)"
        >
            <option v-t="'actions.auto'" value="auto" />
            <option v-t="'actions.dark'" value="dark" />
            <option v-t="'actions.light'" value="light" />
        </select>
    </label>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="ddlLanguageSelection"
    >
        <strong v-t="'actions.language_selection'" />
        <select
            id="ddlLanguageSelection"
            v-model="selectedLanguage"
            class="h-8 w-auto bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
            @change="onChange($event)"
        >
            <option v-for="language in languages" :key="language.code" :value="language.code" v-text="language.name" />
        </select>
    </label>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="ddlCountrySelection"
    >
        <strong v-t="'actions.country_selection'" />
        <select
            id="ddlCountrySelection"
            v-model="countrySelected"
            class="h-8 w-50 bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
            @change="onChange($event)"
        >
            <option v-for="country in countryMap" :key="country.code" :value="country.code" v-text="country.name" />
        </select>
    </label>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="ddlDefaultHomepage"
    >
        <strong v-t="'actions.default_homepage'" />
        <select
            id="ddlDefaultHomepage"
            v-model="defaultHomepage"
            class="h-8 w-auto bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
            @change="onChange($event)"
        >
            <option v-t="'titles.trending'" value="trending" />
            <option v-t="'titles.feed'" value="feed" />
        </select>
    </label>

    <h2 v-t="'titles.player'" class="text-center" />
    <PreferenceRow for-id="chkAutoPlayVideo">
        <template #label>
            <strong v-t="'actions.autoplay_video'" />
        </template>
        <PreferenceSwitch id="chkAutoPlayVideo" v-model="autoPlayVideo" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkAutoDisplayCaptions">
        <template #label>
            <strong v-t="'actions.auto_display_captions'" />
        </template>
        <PreferenceSwitch id="chkAutoDisplayCaptions" v-model="autoDisplayCaptions" @change="onChange" />
    </PreferenceRow>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="chkAutoPlayNextCountdown"
    >
        <strong v-t="'actions.autoplay_next_countdown'" />
        <PreferenceNumberField
            id="chkAutoPlayNextCountdown"
            v-model="autoPlayNextCountdown"
            :min="0"
            @change="onChange"
        />
    </label>
    <PreferenceRow for-id="chkAudioOnly">
        <template #label>
            <strong v-t="'actions.audio_only'" />
        </template>
        <PreferenceSwitch id="chkAudioOnly" v-model="listen" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkPreferHls">
        <template #label>
            <strong v-t="'actions.prefer_hls'" />
        </template>
        <PreferenceSwitch id="chkPreferHls" v-model="preferHls" @change="onChange" />
    </PreferenceRow>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="ddlDefaultQuality"
    >
        <strong v-t="'actions.default_quality'" />
        <select
            id="ddlDefaultQuality"
            v-model.number="defaultQuality"
            class="h-8 w-auto bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
            @change="onChange($event)"
        >
            <option v-t="'actions.auto'" :value="0" />
            <option v-for="resolution in resolutions" :key="resolution" :value="resolution" v-text="`${resolution}p`" />
        </select>
    </label>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="txtBufferingGoal"
    >
        <strong v-t="'actions.buffering_goal'" />
        <PreferenceNumberField id="txtBufferingGoal" v-model="bufferingGoal" :min="10" @change="onChange" />
    </label>
    <PreferenceRow for-id="chkMinimizeComments">
        <template #label>
            <strong v-t="'actions.minimize_comments_default'" />
        </template>
        <PreferenceSwitch id="chkMinimizeComments" v-model="minimizeComments" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkMinimizeDescription">
        <template #label>
            <strong v-t="'actions.minimize_description_default'" />
        </template>
        <PreferenceSwitch id="chkMinimizeDescription" v-model="minimizeDescription" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkMinimizeRecommendations">
        <template #label>
            <strong v-t="'actions.minimize_recommendations_default'" />
        </template>
        <PreferenceSwitch id="chkMinimizeRecommendations" v-model="minimizeRecommendations" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkMinimizeChapters">
        <template #label>
            <strong v-t="'actions.minimize_chapters_default'" />
        </template>
        <PreferenceSwitch id="chkMinimizeChapters" v-model="minimizeChapters" @change="onChange" />
    </PreferenceRow>
    <!-- chapters layout on mobile -->
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] lg:invisible dark:odd:bg-dark-800"
        for="chkMinimizeChapters"
    >
        <strong v-t="'actions.chapters_layout_mobile'" />

        <select
            id="ddlDefaultHomepage"
            v-model="mobileChapterLayout"
            class="h-8 w-auto bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
            @change="onChange($event)"
        >
            <option v-t="'video.chapters_horizontal'" value="Horizontal" />
            <option v-t="'video.chapters_vertical'" value="Vertical" />
        </select>
    </label>
    <PreferenceRow for-id="chkShowWatchOnYouTube">
        <template #label>
            <strong v-t="'actions.show_watch_on_youtube'" />
        </template>
        <PreferenceSwitch id="chkShowWatchOnYouTube" v-model="showWatchOnYouTube" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkShowSearchSuggestions">
        <template #label>
            <strong v-t="'actions.show_search_suggestions'" />
        </template>
        <PreferenceSwitch id="chkShowSearchSuggestions" v-model="searchSuggestions" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkStoreSearchHistory">
        <template #label>
            <strong v-t="'actions.store_search_history'" />
        </template>
        <PreferenceSwitch id="chkStoreSearchHistory" v-model="searchHistory" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkStoreWatchHistory">
        <template #label>
            <strong v-t="'actions.store_watch_history'" />
        </template>
        <PreferenceSwitch id="chkStoreWatchHistory" v-model="watchHistory" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow v-if="watchHistory" for-id="chkHideWatched">
        <template #label>
            <strong v-t="'actions.hide_watched'" />
        </template>
        <PreferenceSwitch id="chkHideWatched" v-model="hideWatched" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="ddlEnabledCodecs">
        <template #label>
            <strong v-t="'actions.enabled_codecs'" />
        </template>
        <PreferenceListbox id="ddlEnabledCodecs" v-model="enabledCodecs" :options="codecOptions" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkDisableLBRY">
        <template #label>
            <strong v-t="'actions.disable_lbry'" />
        </template>
        <PreferenceSwitch id="chkDisableLBRY" v-model="disableLBRY" @change="onChange" />
    </PreferenceRow>
    <PreferenceRow for-id="chkEnableLBRYProxy">
        <template #label>
            <strong v-t="'actions.enable_lbry_proxy'" />
        </template>
        <PreferenceSwitch id="chkEnableLBRYProxy" v-model="proxyLBRY" @change="onChange" />
    </PreferenceRow>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="txtPrefetchLimit"
    >
        <strong v-t="'actions.concurrent_prefetch_limit'" />
        <PreferenceNumberField id="txtPrefetchLimit" v-model="prefetchLimit" :min="0" @change="onChange" />
    </label>

    <h2 class="text-center">SponsorBlock</h2>
    <p class="text-center">
        <span v-t="'actions.uses_api_from'" /><a
            class="hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
            href="https://sponsor.ajay.app/"
            >sponsor.ajay.app</a
        >
    </p>
    <PreferenceRow for-id="chkEnableSponsorblock">
        <template #label>
            <strong v-t="'actions.enable_sponsorblock'" />
        </template>
        <PreferenceSwitch id="chkEnableSponsorblock" v-model="sponsorBlock" @change="onChange" />
    </PreferenceRow>
    <div v-if="sponsorBlock">
        <label
            v-for="(item, name) in skipOptions"
            :key="name"
            class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
            :for="'ddlSkip_' + name"
        >
            <strong v-t="item.label" />
            <select
                :id="'ddlSkip_' + name"
                v-model="item.value"
                class="h-8 w-auto bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
                @change="onChange($event)"
            >
                <option v-t="'actions.no'" value="no" />
                <option v-t="'actions.skip_button_only'" value="button" />
                <option v-t="'actions.skip_automatically'" value="auto" />
            </select>
        </label>
        <PreferenceRow for-id="chkShowMarkers">
            <template #label>
                <strong v-t="'actions.show_markers'" />
            </template>
            <PreferenceSwitch id="chkShowMarkers" v-model="showMarkers" @change="onChange" />
        </PreferenceRow>
        <label
            class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
            for="txtMinSegmentLength"
        >
            <strong v-t="'actions.min_segment_length'" />
            <PreferenceNumberField id="txtMinSegmentLength" v-model="minSegmentLength" :min="0" @change="onChange" />
        </label>
    </div>

    <h2 v-t="'titles.dearrow'" class="text-center" />
    <p class="text-center">
        <span v-t="'actions.uses_api_from'" /><a
            class="hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
            href="https://sponsor.ajay.app/"
            >sponsor.ajay.app</a
        >
    </p>
    <PreferenceRow for-id="chkDeArrow">
        <template #label>
            <strong v-t="'actions.enable_dearrow'" />
        </template>
        <PreferenceSwitch id="chkDeArrow" v-model="dearrow" @change="onChange" />
    </PreferenceRow>

    <h2 v-t="'titles.instance'" class="text-center" />
    <p v-t="'actions.instances_not_shown'" class="text-center" />
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="ddlInstanceSelection"
    >
        <strong v-text="`${$t('actions.instance_selection')}:`" />
        <select
            id="ddlInstanceSelection"
            v-model="selectedInstance"
            class="h-8 w-auto bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
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
    <PreferenceRow for-id="chkAuthInstance">
        <template #label>
            <strong v-text="`${$t('actions.different_auth_instance')}:`" />
        </template>
        <PreferenceSwitch id="chkAuthInstance" v-model="authInstance" @change="onChange" />
    </PreferenceRow>
    <template v-if="authInstance">
        <label
            class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
            for="ddlAuthInstanceSelection"
        >
            <strong v-text="`${$t('actions.instance_auth_selection')}:`" />
            <select
                id="ddlAuthInstanceSelection"
                v-model="selectedAuthInstance"
                class="h-8 w-auto bg-gray-300 text-gray-600 dark:bg-dark-400 dark:text-gray-400"
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
    <div class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800">
        <span v-t="'titles.custom_instances'" class="w-max" />
        <button
            v-t="'actions.customize'"
            class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            @click="showCustomInstancesModal = true"
        />
    </div>
    <br />

    <!-- options that are visible only when logged in -->
    <div v-if="authenticated">
        <h2 v-t="'titles.account'" class="text-center"></h2>
        <label
            class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
            for="txtDeleteAccountPassword"
        >
            <strong v-t="'actions.delete_account'" />
            <div class="flex items-center">
                <input
                    id="txtDeleteAccountPassword"
                    ref="txtDeleteAccountPassword"
                    v-model="password"
                    :placeholder="$t('login.password')"
                    :aria-label="$t('login.password')"
                    class="mr-2 h-8 w-auto rounded-md bg-gray-300 px-2.5 text-gray-600 focus:shadow-red-400 focus:outline-2 focus:outline-red-500 dark:bg-dark-400 dark:text-gray-400"
                    type="password"
                    @keyup.enter="deleteAccount"
                />
                <a
                    v-t="'actions.delete_account'"
                    class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="deleteAccount"
                />
            </div>
        </label>
        <div
            class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        >
            <a
                v-t="'actions.logout'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                @click="logout"
            />
            <a
                v-t="'actions.invalidate_session'"
                class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                style="margin-left: 0.5em"
                @click="invalidateSession"
            />
        </div>
        <br />
    </div>
    <h2 v-t="'actions.blocked_channels'"></h2>
    <label
        class="mx-[15vw] my-2 flex items-center justify-between odd:bg-gray-200 max-md:mx-[2vw] dark:odd:bg-dark-800"
        for="blockedChannels"
    >
        <strong v-t="'actions.blocked_channels'" />
        <input
            id="blockedChannels"
            v-model="blockedChannels"
            type="text"
            class="input w-auto mr-2"
            @change="onChange($event)"
        />
    </label>
    <h2 id="instancesList" v-t="'actions.instances_list'" />
    <table class="w-full border text-left text-lg font-light">
        <thead>
            <tr>
                <th v-t="'preferences.instance_name'" />
                <th v-t="'preferences.instance_locations'" />
                <th v-t="'preferences.has_cdn'" />
                <th v-t="'preferences.registered_users'" />
                <th v-t="'preferences.version'" class="max-md:hidden" />
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
                <td class="max-md:hidden" v-text="instance.version" />
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
    <button
        v-t="'actions.reset_preferences'"
        class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
        @click="showConfirmResetPrefsDialog = true"
    />
    <button
        v-t="'actions.backup_preferences'"
        class="mx-4 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
        @click="backupPreferences()"
    />
    <label
        v-t="'actions.restore_preferences'"
        for="fileSelector"
        class="inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
        @click="restorePreferences()"
    />
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
import { computed, onActivated, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import CountryMapDefault from "@/utils/CountryMaps/en.json";
import ConfirmModal from "./ConfirmModal.vue";
import CustomInstanceModal from "./CustomInstanceModal.vue";
import PreferenceListbox from "./ui/PreferenceListbox.vue";
import PreferenceNumberField from "./ui/PreferenceNumberField.vue";
import PreferenceRow from "./ui/PreferenceRow.vue";
import PreferenceSwitch from "./ui/PreferenceSwitch.vue";
import {
    testLocalStorage,
    usePreferenceBoolean,
    usePreferenceJSON,
    usePreferenceNumber,
    usePreferenceString,
} from "@/composables/usePreferences";
import { fetchJson, apiUrl, authApiUrl, getAuthToken, hashCode, isAuthenticated } from "@/composables/useApi";
import { getCustomInstances } from "@/composables/useCustomInstances";
import { download } from "@/composables/useMisc";
import { getDefaultLanguage } from "@/composables/useFormatting";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const fileSelectorEl = ref(null);

function createDefaultSkipOptions() {
    return {
        sponsor: { value: "auto", label: "actions.skip_sponsors" },
        intro: { value: "no", label: "actions.skip_intro" },
        outro: { value: "no", label: "actions.skip_outro" },
        preview: { value: "no", label: "actions.skip_preview" },
        interaction: { value: "auto", label: "actions.skip_interaction" },
        selfpromo: { value: "auto", label: "actions.skip_self_promo" },
        music_offtopic: { value: "auto", label: "actions.skip_non_music" },
        poi_highlight: { value: "no", label: "actions.skip_highlight" },
        filler: { value: "no", label: "actions.skip_filler_tangent" },
    };
}

const mobileChapterLayout = usePreferenceString("mobileChapterLayout", "Vertical");
const selectedInstance = usePreferenceString("instance", import.meta.env.VITE_PIPED_API);
const authInstance = usePreferenceBoolean("authInstance", false);
const selectedAuthInstance = usePreferenceString("auth_instance_url", selectedInstance.value);
const customInstances = ref([]);
const publicInstances = ref([]);
const sponsorBlock = usePreferenceBoolean("sponsorblock", true);
const skipOptionsStorage = usePreferenceJSON("skipOptions", null);
const skipOptions = ref(createDefaultSkipOptions());
const showMarkers = usePreferenceBoolean("showMarkers", true);
const minSegmentLength = usePreferenceNumber("minSegmentLength", 0);
const dearrow = usePreferenceBoolean("dearrow", false);
const selectedTheme = usePreferenceString("theme", "dark");
const autoPlayVideo = usePreferenceBoolean("playerAutoPlay", true);
const autoDisplayCaptions = usePreferenceBoolean("autoDisplayCaptions", false);
const autoPlayNextCountdown = usePreferenceNumber("autoPlayNextCountdown", 5);
const listen = usePreferenceBoolean("listen", false);
const resolutions = [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320];
const preferHls = usePreferenceBoolean("preferHls", false);
const defaultQuality = usePreferenceNumber("quality", 0);
const bufferingGoal = usePreferenceNumber("bufferGoal", 10);
const countryMap = ref(CountryMapDefault);
const countrySelected = usePreferenceString("region", "US");
const defaultHomepage = usePreferenceString("homepage", "trending");
const minimizeComments = usePreferenceBoolean("minimizeComments", false);
const minimizeDescription = usePreferenceBoolean("minimizeDescription", true);
const minimizeRecommendations = usePreferenceBoolean("minimizeRecommendations", false);
const minimizeChapters = usePreferenceBoolean("minimizeChapters", false);
const showWatchOnYouTube = usePreferenceBoolean("showWatchOnYouTube", false);
const searchSuggestions = usePreferenceBoolean("searchSuggestions", true);
const watchHistory = usePreferenceBoolean("watchHistory", false);
const searchHistory = usePreferenceBoolean("searchHistory", false);
const hideWatched = usePreferenceBoolean("hideWatched", false);
const selectedLanguage = usePreferenceString("hl", "en");
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
const enabledCodecsStorage = usePreferenceString("enabledCodecs", "vp9,avc");
const enabledCodecs = computed({
    get() {
        return enabledCodecsStorage.value?.split(",").filter(Boolean) ?? [];
    },
    set(value) {
        enabledCodecsStorage.value = value.join(",");
    },
});
const codecOptions = [
    { value: "av1", label: "AV1" },
    { value: "vp9", label: "VP9" },
    { value: "avc", label: "AVC (h.264)" },
];
const disableLBRY = usePreferenceBoolean("disableLBRY", false);
const proxyLBRY = usePreferenceBoolean("proxyLBRY", false);
const blockedChannels = usePreferenceString("blockedChannels", "");
const prefetchLimit = usePreferenceNumber("prefetchLimit", 2);
const password = ref(null);
const showConfirmResetPrefsDialog = ref(false);
const showCustomInstancesModal = ref(false);

const authenticated = computed(() => isAuthenticated());
const instances = computed(() => [...publicInstances.value, ...customInstances.value]);

function normalizeSkipOptions(rawSkipOptions) {
    const normalized = createDefaultSkipOptions();
    if (!rawSkipOptions || typeof rawSkipOptions !== "object") return normalized;

    Object.entries(rawSkipOptions).forEach(([key, value]) => {
        const currentOption = normalized[key];
        if (!currentOption) {
            console.log("Unknown sponsor type: " + key);
            return;
        }

        if (value && typeof value === "object" && "value" in value) currentOption.value = value.value;
        else if (typeof value === "string") currentOption.value = value;
    });

    return normalized;
}

watch(
    skipOptions,
    value => {
        skipOptionsStorage.value = Object.fromEntries(
            Object.entries(value).map(([key, option]) => [key, option.value]),
        );
    },
    { deep: true },
);

onActivated(() => {
    document.title = t("titles.preferences") + " - Piped";
});

async function loadCountryMap(language) {
    if (language === "en") {
        countryMap.value = CountryMapDefault;
        return;
    }

    try {
        countryMap.value = await import(`../utils/CountryMaps/${language}.json`).then(val => val.default);
    } catch {
        countryMap.value = CountryMapDefault;
        console.error("Countries not translated into " + language);
    }
}

watch(
    selectedLanguage,
    language => {
        loadCountryMap(language);
    },
    { immediate: true },
);

watch(searchHistory, value => {
    if (!value) localStorage.removeItem("search_history");
});

onMounted(async () => {
    if (Object.keys(route.query).length > 0) router.replace({ query: {} });

    fetchInstances();

    if (testLocalStorage()) {
        skipOptions.value = normalizeSkipOptions(skipOptionsStorage.value);

        if (localStorage.getItem("hl") === null) selectedLanguage.value = await getDefaultLanguage();
        if (!selectedAuthInstance.value) selectedAuthInstance.value = selectedInstance.value;

        if (skipOptionsStorage.value === null) {
            const legacySelectedSkip = localStorage.getItem("selectedSkip");
            if (legacySelectedSkip) {
                const nextSkipOptions = createDefaultSkipOptions();

                for (const skip of legacySelectedSkip.split(",")) {
                    if (nextSkipOptions[skip] !== undefined) nextSkipOptions[skip].value = "auto";
                    else console.log("Unknown sponsor type: " + skip);
                }

                skipOptions.value = nextSkipOptions;
            }
        }
    }
});

function onChange() {
    if (!searchHistory.value) localStorage.removeItem("search_history");
    minSegmentLength.value = Math.max(minSegmentLength.value || 0, 0);
    bufferingGoal.value = Math.max(bufferingGoal.value || 10, 10);
    prefetchLimit.value = Math.max(prefetchLimit.value || 0, 0);
    autoPlayNextCountdown.value = Math.max(autoPlayNextCountdown.value || 0, 0);
}

async function fetchInstances() {
    customInstances.value = getCustomInstances();

    fetchJson(import.meta.env.VITE_PIPED_INSTANCES).then(resp => {
        publicInstances.value = resp;
        if (!publicInstances.value.some(instance => instance.api_url == apiUrl())) {
            publicInstances.value.push({
                name: "Selected Instance",
                api_url: apiUrl(),
                locations: "Unknown",
                cdn: false,
                uptime_30d: 100,
            });
        }
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
