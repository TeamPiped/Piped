<template>
    <div v-if="showVideo" class="flex flex-col flex-justify-between">
        <router-link
            class="link inline-block w-full"
            :to="{
                path: '/watch',
                query: {
                    v: item.url.substr(-11),
                    ...(playlistId && { list: playlistId }),
                    ...(index >= 0 && { index: index + 1 }),
                    ...(preferListen && { listen: 1 }),
                },
            }"
        >
            <VideoThumbnail :item="item" />

            <div>
                <p
                    style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                    class="link flex overflow-hidden pt-2 font-bold"
                    :title="title"
                    v-text="title"
                />
            </div>
        </router-link>

        <div class="flex">
            <router-link :to="item.uploaderUrl">
                <img
                    v-if="item.uploaderAvatar"
                    loading="lazy"
                    :src="item.uploaderAvatar"
                    class="mr-0.5 mt-0.5 h-32px w-32px rounded-full"
                    width="68"
                    height="68"
                />
            </router-link>

            <div class="flex-1 px-2">
                <router-link
                    v-if="item.uploaderUrl && item.uploaderName && !hideChannel"
                    class="link-secondary block overflow-hidden text-sm"
                    :to="item.uploaderUrl"
                    :title="item.uploaderName"
                >
                    <span v-text="item.uploaderName" />
                    <i v-if="item.uploaderVerified" class="i-fa6-solid:check ml-1.5" />
                </router-link>

                <div v-if="item.views >= 0 || item.uploadedDate" class="video-info">
                    <span v-if="item.views >= 0">
                        <i class="i-fa6-solid:eye" />
                        <span class="pl-1" v-text="`${numberFormat(item.views)} •`" />
                    </span>
                    <span
                        v-if="item.uploaded > 0"
                        class="pl-0.5"
                        :title="new Date(item.uploaded).toLocaleString()"
                        v-text="timeAgo(item.uploaded)"
                    />
                    <span v-else-if="item.uploadedDate" class="pl-0.5" v-text="item.uploadedDate" />
                </div>
            </div>

            <div class="flex items-center gap-2.5">
                <router-link
                    :to="{
                        path: '/watch',
                        query: {
                            v: item.url.substr(-11),
                            ...(playlistId && { list: playlistId }),
                            ...(index >= 0 && { index: index + 1 }),
                            ...(!preferListen && { listen: 1 }),
                        },
                    }"
                    :aria-label="preferListen ? title : 'Listen to ' + title"
                    :title="preferListen ? title : 'Listen to ' + title"
                >
                    <i :class="preferListen ? 'i-fa6-solid:tv' : 'i-fa6-solid:headphones'" />
                </router-link>
                <button :title="$t('actions.add_to_playlist')" @click="showPlaylistModal = !showPlaylistModal">
                    <i class="i-fa6-solid:circle-plus" />
                </button>
                <button :title="$t('actions.share')" @click="showShareModal = !showShareModal">
                    <i class="i-fa6-solid:share" />
                </button>
                <button
                    v-if="admin"
                    ref="removeButton"
                    :title="$t('actions.remove_from_playlist')"
                    @click="showConfirmRemove = true"
                >
                    <i class="i-fa6-solid:circle-minus" />
                </button>
                <button
                    v-if="showMarkOnWatched && isFeed"
                    ref="watchButton"
                    @click="toggleWatched(item.url.substr(-11))"
                >
                    <i
                        v-if="item.watched && item.currentTime > item.duration * 0.9"
                        :title="$t('actions.mark_as_unwatched')"
                        class="i-fa6-solid:eye-slash"
                    />
                    <i v-else :title="$t('actions.mark_as_watched')" class="i-fa6-solid:eye" />
                </button>
                <ConfirmModal
                    v-if="showConfirmRemove"
                    :message="$t('actions.delete_playlist_video_confirm')"
                    @close="showConfirmRemove = false"
                    @confirm="removeVideo(item.url.substr(-11))"
                />
                <PlaylistAddModal
                    v-if="showPlaylistModal"
                    :video-id="item.url.substr(-11)"
                    :video-info="item"
                    @close="showPlaylistModal = false"
                />
                <ShareModal
                    v-if="showShareModal"
                    :video-id="item.url.substr(-11)"
                    :current-time="0"
                    @close="showShareModal = false"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import PlaylistAddModal from "./PlaylistAddModal.vue";
import ShareModal from "./ShareModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import VideoThumbnail from "./VideoThumbnail.vue";
import { numberFormat, timeAgo } from "@/composables/useFormatting.js";
import { getPreferenceBoolean } from "@/composables/usePreferences.js";
import { removeVideoFromPlaylist } from "@/composables/usePlaylists.js";

const props = defineProps({
    item: {
        type: Object,
        default: () => {
            return {};
        },
    },
    isFeed: {
        type: Boolean,
        default: false,
    },
    height: { type: String, default: "118" },
    width: { type: String, default: "210" },
    hideChannel: { type: Boolean, default: false },
    index: { type: Number, default: -1 },
    playlistId: { type: String, default: null },
    preferListen: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
});

const emit = defineEmits(["update:watched", "remove"]);

const removeButton = ref(null);
const showPlaylistModal = ref(false);
const showShareModal = ref(false);
const showVideo = ref(true);
const showConfirmRemove = ref(false);
const showMarkOnWatched = ref(false);

const title = computed(() => {
    return props.item.dearrow?.titles[0]?.title ?? props.item.title;
});

function removeVideo() {
    removeButton.value.disabled = true;
    removeVideoFromPlaylist(props.playlistId, props.index).then(json => {
        if (json.error) alert(json.error);
        else emit("remove");
    });
}

function shouldShowVideo() {
    if (!props.isFeed || !getPreferenceBoolean("hideWatched", false)) return;

    const objectStore = window.db.transaction("watch_history", "readonly").objectStore("watch_history");
    const request = objectStore.get(props.item.url.substr(-11));
    request.onsuccess = event => {
        const video = event.target.result;
        if (video && (video.currentTime ?? 0) > video.duration * 0.9) {
            showVideo.value = false;
            return;
        }
    };
}

function shouldShowMarkOnWatched() {
    showMarkOnWatched.value = getPreferenceBoolean("watchHistory", false);
}

function toggleWatched(videoId) {
    if (window.db) {
        var tx = window.db.transaction("watch_history", "readwrite");
        var store = tx.objectStore("watch_history");
        var request = store.get(videoId);
        request.onsuccess = function (event) {
            var video = event.target.result;
            if (video) {
                video.watchedAt = Date.now();
            } else {
                video = {
                    videoId: videoId,
                    title: props.item.title,
                    duration: props.item.duration,
                    thumbnail: props.item.thumbnail,
                    uploaderUrl: props.item.uploaderUrl,
                    uploaderName: props.item.uploaderName,
                    watchedAt: Date.now(),
                };
            }
            video.currentTime = props.item.currentTime < props.item.duration * 0.9 ? props.item.duration : 0;
            store.put(video);
            emit("update:watched", [props.item.url]);
            shouldShowVideo();
        };
    }
}

onMounted(() => {
    shouldShowVideo();
    shouldShowMarkOnWatched();
});
</script>

<style>
.video-info {
    @apply mt-1 text-xs text-gray-600 font-normal;
}

.dark .video-info {
    @apply text-gray-400;
}
</style>
