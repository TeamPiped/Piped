<template>
    <div v-if="showVideo" class="flex flex-col flex-justify-between">
        <router-link
            class="focus:underline hover:underline inline-block w-full"
            :to="{
                path: '/watch',
                query: {
                    v: item.url.substr(-11),
                    ...(playlistId && { list: playlistId }),
                    ...(index >= 0 && { index: index + 1 }),
                },
            }"
        >
            <div class="w-full">
                <img
                    class="w-full aspect-video object-contain"
                    :src="thumbnail"
                    :alt="title"
                    :class="{ 'shorts-img': item.isShort, 'opacity-75': item.watched }"
                    loading="lazy"
                />
                <!-- progress bar -->
                <div class="relative w-full h-1">
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
                    <font-awesome-icon class="w-3" :icon="['fas', 'broadcast-tower']" />
                </i18n-t>
                <span v-if="item.watched" v-t="'video.watched'" class="thumbnail-overlay bottom-5px left-5px" />
            </div>

            <div>
                <p
                    style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                    class="pt-2 overflow-hidden flex link font-bold"
                    :title="title"
                    v-text="title"
                />
            </div>
        </router-link>

        <div class="flex">
            <router-link :to="item.uploaderUrl">
                <img
                    v-if="item.uploaderAvatar"
                    :src="item.uploaderAvatar"
                    loading="lazy"
                    class="rounded-full mr-0.5 mt-0.5 w-32px h-32px"
                    width="68"
                    height="68"
                />
            </router-link>

            <div class="px-2 flex-1">
                <router-link
                    v-if="item.uploaderUrl && item.uploaderName && !hideChannel"
                    class="link-secondary overflow-hidden block text-sm"
                    :to="item.uploaderUrl"
                    :title="item.uploaderName"
                >
                    <span v-text="item.uploaderName" />
                    <font-awesome-icon v-if="item.uploaderVerified" class="ml-1.5" icon="check" />
                </router-link>

                <div v-if="item.views >= 0 || item.uploadedDate" class="text-xs font-normal text-gray-300 mt-1">
                    <span v-if="item.views >= 0">
                        <font-awesome-icon icon="eye" />
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
                            listen: '1',
                        },
                    }"
                    :aria-label="'Listen to ' + title"
                    :title="'Listen to ' + title"
                >
                    <font-awesome-icon icon="headphones" />
                </router-link>
                <button :title="$t('actions.add_to_playlist')" @click="showModal = !showModal">
                    <font-awesome-icon icon="circle-plus" />
                </button>
                <button
                    v-if="admin"
                    ref="removeButton"
                    :title="$t('actions.remove_from_playlist')"
                    @click="showConfirmRemove = true"
                >
                    <font-awesome-icon icon="circle-minus" />
                </button>
                <ConfirmModal
                    v-if="showConfirmRemove"
                    :message="$t('actions.delete_playlist_video_confirm')"
                    @close="showConfirmRemove = false"
                    @confirm="removeVideo(item.url.substr(-11))"
                />
                <PlaylistAddModal
                    v-if="showModal"
                    :video-id="item.url.substr(-11)"
                    :video-info="item"
                    @close="showModal = !showModal"
                />
            </div>
        </div>
    </div>
</template>

<script>
import PlaylistAddModal from "./PlaylistAddModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

export default {
    components: { PlaylistAddModal, ConfirmModal },
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
        admin: { type: Boolean, default: false },
    },
    emits: ["remove"],
    data() {
        return {
            showModal: false,
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
