<template>
    <div v-if="showVideo" class="video-card efy_trans_filter efy_shadow_trans">
        <!-- EFY-->
        <router-link
            class="video_item_link"
            :to="{
                path: '/watch',
                query: {
                    v: item.url.substr(-11),
                    ...(playlistId && { list: playlistId }),
                    ...(index >= 0 && { index: index + 1 }),
                },
            }"
        >
            <img
                :src="thumbnail"
                :alt="title"
                :class="{ 'shorts-img': item.isShort }"
                class="thumbnail"
                loading="lazy"
            />
            <!-- progress bar -->
            <div
                v-if="item.watched && item.duration > 0"
                class="relative h-1 w-full"
                style="
                    height: 4rem;
                    background: rgba(255, 255, 255, 0.067);
                    bottom: 8px;
                    border-radius: 0px;
                    box-shadow: 0 -5rem 10rem #0005;
                    backdrop-filter: blur(24px);
                "
            >
                <div
                    class="absolute bottom-0 left-0"
                    :style="{ width: `clamp(0%, ${(item.currentTime / item.duration) * 100}%, 100%` }"
                    style="
                        height: 4rem;
                        background: var(--efy_color);
                        border-radius: 0 var(--efy_radius0) var(--efy_radius0) 0;
                        box-shadow: 3rem 0 5rem #0005;
                    "
                />
            </div>
            <div class="flex items-center h-[44rem] overflow-hidden">
                <p v-text="title" class="pp-video-card-title" />
            </div>
        </router-link>

        <div class="pp-video-card-buttons">
            <button
                v-if="item.duration > 0"
                v-text="timeFormat(item.duration)"
                class="efy_shadow_trans efy_shadow_button_off efy_button_text_off"
                tabindex="-1"
            />
            <button
                v-if="item.views >= 0"
                class="efy_shadow_trans efy_shadow_button_off efy_button_text_off"
                tabindex="-1"
            >
                <font-awesome-icon icon="eye" style="margin-right: 5rem" />
                <span v-text="`${numberFormat(item.views)}`" />
            </button>
            <router-link
                class="btn efy_shadow_trans efy_shadow_button_off efy_button_text_off"
                role="button"
                :to="{
                    path: '/watch',
                    query: {
                        v: item.url.substr(-11),
                        ...(playlistId && { list: playlistId }),
                        ...(index >= 0 && { index: index + 1 }),
                        listen: '1',
                    },
                }"
                :aria-label="'Listen to ' + item.title"
                :title="'Listen to ' + item.title"
            >
                <font-awesome-icon icon="headphones" />
            </router-link>
            <button
                :title="$t('actions.add_to_playlist')"
                @click="showModal = !showModal"
                class="btn efy_shadow_trans efy_shadow_button_off efy_button_text_off"
            >
                <font-awesome-icon icon="circle-plus" />
            </button>
            <button
                v-if="admin"
                ref="removeButton"
                :title="$t('actions.remove_from_playlist')"
                class="efy_shadow_trans efy_shadow_button_off efy_button_text_off"
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
            <button
                v-if="item.uploaded > 0"
                class="efy_shadow_trans efy_shadow_button_off efy_button_text_off"
                v-text="timeAgo(item.uploaded)"
            />
            <button v-else-if="item.uploadedDate" v-text="item.uploadedDate" tabindex="-1" />
            <button class="pp-color" v-if="item.isShort" v-t="'video.shorts'" tabindex="-1" />
            <button v-else-if="item.duration < 0" v-t="'video.live'" class="pp-color" tabindex="-1" />
            <button v-if="item.watched" v-t="'video.watched'" class="pp-color" tabindex="-1" />
        </div>

        <router-link
            v-if="item.uploaderUrl && item.uploaderName && !hideChannel"
            :to="item.uploaderUrl"
            :title="item.uploaderName"
            class="pp-video-card-channel"
        >
            <img
                v-if="item.uploaderAvatar"
                :src="item.uploaderAvatar"
                loading="lazy"
                class="mt-0.5 w-36rem h-36rem efy_shadow_trans efy_shadow_button_off"
                width="36"
                height="36"
            />
            <div class="pp-text efy_shadow_trans efy_shadow_button_off">
                <span v-text="item.uploaderName" />
                <font-awesome-icon class="ml-1.5" v-if="item.uploaderVerified" icon="check" />
            </div>
        </router-link>
    </div>
</template>

<style>
.shorts-img {
    @apply w-full object-contain;
}
.video_item_link {
    display: block;
}
</style>

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
