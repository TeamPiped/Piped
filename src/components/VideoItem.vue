<template>
    <div v-if="showVideo" class="flex flex-col flex-justify-between">
        <router-link
            class="inline-block w-full focus:underline hover:underline"
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
            <div class="w-full">
                <img
                    loading="lazy"
                    class="aspect-video w-full object-contain"
                    :src="thumbnail"
                    :alt="title"
                    :class="{ 'shorts-img': item.isShort, 'opacity-75': item.watched }"
                />
                <!-- progress bar -->
                <div class="relative h-1 w-full">
                    <div
                        v-if="item.watched && item.duration > 0"
                        class="absolute bottom-0 left-0 h-1 bg-red-600"
                        :style="{ width: `clamp(0%, ${(item.currentTime / item.duration) * 100}%, 100%` }"
                    />
                </div>
            </div>

            <div class="relative text-sm">
                <span
                    v-if="item.duration > 0"
                    class="thumbnail-overlay thumbnail-right"
                    v-text="timeFormat(item.duration)"
                />
                <!-- shorts thumbnail -->
                <span v-if="item.isShort" v-t="'video.shorts'" class="thumbnail-overlay thumbnail-left" />
                <span
                    v-else-if="item.duration >= 0"
                    class="thumbnail-overlay thumbnail-right"
                    v-text="timeFormat(item.duration)"
                />
                <i18n-t v-else keypath="video.live" class="thumbnail-overlay thumbnail-right !bg-red-600" tag="div">
                    <i class="i-fa6-solid:tower-broadcast w-3" />
                </i18n-t>
                <span v-if="item.watched" v-t="'video.watched'" class="thumbnail-overlay bottom-5px left-5px" />
            </div>

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

                <div v-if="item.views >= 0 || item.uploadedDate" class="mt-1 text-xs text-gray-300 font-normal">
                    <span v-if="item.views >= 0">
                        <i class="i-fa6-solid:eye" />
                        <span class="pl-1" v-text="`${numberFormat(item.views)} •`" />
                    </span>
                    <span v-if="item.uploaded > 0" class="pl-0.5" v-text="timeAgo(item.uploaded)" />
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

<script>
import PlaylistAddModal from "./PlaylistAddModal.vue";
import ShareModal from "./ShareModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

export default {
    components: { PlaylistAddModal, ConfirmModal, ShareModal },
    props: {
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
    },
    emits: ["remove"],
    data() {
        return {
            showPlaylistModal: false,
            showShareModal: false,
            showVideo: true,
            showConfirmRemove: false,
        };
    },
    computed: {
        title() {
            return this.item.dearrow?.titles[0]?.title ?? this.item.title;
        },
        thumbnail() {
            return this.item.dearrow?.thumbnails[0]?.thumbnail ?? this.item.thumbnail;
        },
    },
    mounted() {
        this.shouldShowVideo();
    },
    methods: {
        removeVideo() {
            this.$refs.removeButton.disabled = true;
            this.removeVideoFromPlaylist(this.playlistId, this.index).then(json => {
                if (json.error) alert(json.error);
                else this.$emit("remove");
            });
        },
        shouldShowVideo() {
            if (!this.isFeed || !this.getPreferenceBoolean("hideWatched", false)) return;

            const objectStore = window.db.transaction("watch_history", "readonly").objectStore("watch_history");
            const request = objectStore.get(this.item.url.substr(-11));
            request.onsuccess = event => {
                const video = event.target.result;
                if (video && (video.currentTime ?? 0) > video.duration * 0.9) {
                    this.showVideo = false;
                    return;
                }
            };
        },
    },
};
</script>

<style>
.shorts-img {
    @apply w-full object-contain;
}
</style>
