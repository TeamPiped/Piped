<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

    <LoadingIndicatorPage v-show="!playlist?.error" :show-content="playlist != null">
        <h1 class="mt-4 mb-1 ml-1 text-3xl!" v-text="playlist.name" />

        <CollapsableText v-if="playlist?.description" :text="playlist.description" />

        <div class="mt-1 flex justify-between max-md:flex-col md:items-center">
            <div>
                <router-link
                    class="flex items-center gap-3 hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
                    :to="playlist.uploaderUrl || '/'"
                >
                    <img loading="lazy" :src="playlist.uploaderAvatar" class="h-12 rounded-full" />
                    <strong v-text="playlist.uploader" />
                </router-link>
            </div>
            <div class="flex flex-wrap items-center gap-1">
                <strong
                    v-text="
                        `${playlist.videos} ${$t('video.videos')} - ${timeFormat(totalDuration)}${
                            playlist.nextpage ? '+' : ''
                        }`
                    "
                />
                <button
                    v-if="!isPipedPlaylist"
                    class="mx-1 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="bookmarkPlaylist"
                >
                    {{ $t(`actions.${isBookmarked ? "playlist_bookmarked" : "bookmark_playlist"}`)
                    }}<i-fa6-solid-bookmark class="ml-3" />
                </button>
                <button
                    v-if="authenticated && !isPipedPlaylist"
                    class="mr-1 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="clonePlaylist"
                >
                    {{ $t("actions.clone_playlist") }}<i-fa6-solid-clone class="ml-3" />
                </button>
                <button
                    class="mr-1 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    @click="downloadPlaylistAsTxt"
                >
                    {{ $t("actions.download_as_txt") }}
                </button>
                <a
                    class="mr-1 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
                    :href="getRssUrl"
                >
                    <i-fa6-solid-rss />
                </a>
                <WatchOnButton :link="`https://www.youtube.com/playlist?list=${$route.query.list}`" />
            </div>
        </div>

        <hr />

        <div
            class="mx-2 grid grid-cols-1 gap-y-5 max-md:gap-x-3 sm:mx-0 sm:grid-cols-2 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 xl:grid-cols-5"
        >
            <VideoItem
                v-for="(video, index) in playlist.relatedStreams"
                :key="video.url"
                :item="video"
                :index="index"
                :playlist-id="$route.query.list"
                :admin="admin"
                height="94"
                width="168"
                @remove="removeVideo(index)"
            />
        </div>
    </LoadingIndicatorPage>
</template>

<script setup>
import { ref, computed, onMounted, onActivated, onDeactivated } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import ErrorHandler from "./ErrorHandler.vue";
import LoadingIndicatorPage from "./LoadingIndicatorPage.vue";
import CollapsableText from "./CollapsableText.vue";
import VideoItem from "./VideoItem.vue";
import WatchOnButton from "./WatchOnButton.vue";
import { fetchJson, authApiUrl, getAuthToken, isAuthenticated } from "@/composables/useApi.js";
import { getPlaylists } from "@/composables/usePlaylists.js";
import { getPlaylist } from "@/composables/usePlaylists.js";
import { updateWatched, download } from "@/composables/useMisc.js";
import { fetchDeArrowContent } from "@/composables/useSubscriptions.js";
import { timeFormat } from "@/composables/useFormatting.js";

const route = useRoute();
const { t } = useI18n();

const playlist = ref(null);
const totalDuration = ref(0);
const admin = ref(false);
const isBookmarked = ref(false);
let loading = false;

const getRssUrl = computed(() => {
    return authApiUrl() + "/rss/playlists/" + route.query.list;
});

const isPipedPlaylist = computed(() => {
    return /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}/.test(route.query.list);
});

function updateTitle() {
    document.title = playlist.value.name + " - Piped";
}

function updateTotalDuration() {
    totalDuration.value = playlist.value.relatedStreams.map(video => video.duration).reduce((a, b) => a + b);
}

async function getPlaylistData() {
    getPlaylist(route.query.list)
        .then(data => (playlist.value = data))
        .then(() => {
            updateTitle();
            updateTotalDuration();
            updateWatched(playlist.value.relatedStreams);
            fetchDeArrowContent(playlist.value.relatedStreams);
        });
}

function handleScroll() {
    if (loading || !playlist.value || !playlist.value.nextpage) return;
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
        loading = true;
        fetchJson(authApiUrl() + "/nextpage/playlists/" + route.query.list, {
            nextpage: playlist.value.nextpage,
        }).then(json => {
            playlist.value.nextpage = json.nextpage;
            loading = false;
            playlist.value.relatedStreams.push(...json.relatedStreams);
            updateTotalDuration();
            fetchDeArrowContent(json.relatedStreams);
        });
    }
}

function removeVideo(index) {
    playlist.value.relatedStreams.splice(index, 1);
}

async function clonePlaylist() {
    fetchJson(authApiUrl() + "/import/playlist", null, {
        method: "POST",
        headers: {
            Authorization: getAuthToken(),
        },
        body: JSON.stringify({
            playlistId: route.query.list,
        }),
    }).then(resp => {
        if (!resp.error) {
            alert(t("actions.clone_playlist_success"));
        } else alert(resp.error);
    });
}

function downloadPlaylistAsTxt() {
    const data = playlist.value.relatedStreams
        .map(video => {
            return "https://piped.video" + video.url;
        })
        .join("\n");
    download(data, playlist.value.name + ".txt", "text/plain");
}

async function bookmarkPlaylist() {
    if (!playlist.value) return;

    if (isBookmarked.value) {
        removePlaylistBookmark();
        return;
    }

    if (window.db) {
        const playlistId = route.query.list;
        var tx = window.db.transaction("playlist_bookmarks", "readwrite");
        var store = tx.objectStore("playlist_bookmarks");
        store.put({
            playlistId: playlistId,
            name: playlist.value.name,
            uploader: playlist.value.uploader,
            uploaderUrl: playlist.value.uploaderUrl,
            thumbnail: playlist.value.thumbnailUrl,
            uploaderAvatar: playlist.value.uploaderAvatar,
            videos: playlist.value.videos,
        });
        isBookmarked.value = true;
    }
}

async function removePlaylistBookmark() {
    var tx = window.db.transaction("playlist_bookmarks", "readwrite");
    var store = tx.objectStore("playlist_bookmarks");
    store.delete(route.query.list);
    isBookmarked.value = false;
}

async function checkPlaylistBookmarked() {
    const playlistId = route.query.list;
    var tx = window.db.transaction("playlist_bookmarks", "readwrite");
    var store = tx.objectStore("playlist_bookmarks");
    var req = store.openCursor(playlistId);
    req.onsuccess = function (e) {
        var cursor = e.target.result;
        isBookmarked.value = cursor ? true : false;
    };
}

onMounted(() => {
    const playlistId = route.query.list;
    if (isAuthenticated() && playlistId?.length == 36)
        getPlaylists().then(json => {
            if (json.error) alert(json.error);
            else if (json.some(pl => pl.id === playlistId)) admin.value = true;
        });
    else if (playlistId.startsWith("local")) admin.value = true;
    checkPlaylistBookmarked();
});

onActivated(() => {
    getPlaylistData();
    window.addEventListener("scroll", handleScroll);
    if (playlist.value) updateTitle();
});

onDeactivated(() => {
    window.removeEventListener("scroll", handleScroll);
});
</script>
