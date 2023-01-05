<template>
    <div v-if="showVideo" class="efy_trans_filter">
        <router-link
            :to="{
                path: '/watch',
                query: {
                    v: item.url.substr(-11),
                    ...(playlistId && { list: playlistId }),
                    ...(index >= 0 && { index: index + 1 }),
                },
            }"
            class="video_item_link"
        >
            <img
                class="w-full"
                :src="item.thumbnail"
                :alt="item.title"
                :class="{ 'shorts-img': item.isShort }"
                loading="lazy"
            />
            <p class="pp-video-card-title my-2 overflow-hidden flex link" :title="item.title" v-text="item.title" />
        </router-link>

        <div class="pp-video-card-buttons">
            <button v-if="item.duration > 0" v-text="timeFormat(item.duration)" tabindex="-1" />
            <button v-if="item.views >= 0" tabindex="-1">
                <font-awesome-icon icon="eye" />
                <span class="pl-0.5" v-text="`${numberFormat(item.views)}`" />
            </button>
            <router-link
                class="btn"
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
            <button v-if="authenticated" :title="$t('actions.add_to_playlist')" @click="showModal = !showModal">
                <font-awesome-icon icon="circle-plus" />
            </button>
            <button
                v-if="admin"
                :title="$t('actions.remove_from_playlist')"
                ref="removeButton"
                @click="removeVideo(item.url.substr(-11))"
            >
                <font-awesome-icon icon="circle-minus" />
            </button>
            <button v-if="item.uploadedDate" class="pl-0.5" v-text="item.uploadedDate" tabindex="-1" />
            <button class="pp-color" v-if="item.isShort" v-t="'video.shorts'" tabindex="-1" />
            <button v-else-if="item.duration < 0" v-t="'video.live'" class="pp-color" tabindex="-1" />
            <button v-if="item.watched" v-t="'video.watched'" class="pp-color" tabindex="-1" />
        </div>

        <router-link
            :to="item.uploaderUrl"
            class="pp-video-card-channel"
            v-if="item.uploaderUrl && item.uploaderName && !hideChannel"
        >
            <img
                v-if="item.uploaderAvatar"
                :src="item.uploaderAvatar"
                loading="lazy"
                :alt="item.uploaderName"
                class="mt-0.5 w-36rem h-36rem"
                width="36"
                height="36"
            />

            <div class="pp-text" title="item.uploaderName">
                <span v-text="item.uploaderName" />
                <font-awesome-icon class="ml-1.5" v-if="item.uploaderVerified" icon="check" />
            </div>
        </router-link>
    </div>
    <PlaylistAddModal v-if="showModal" :video-id="video.url.substr(-11)" @close="showModal = !showModal" />
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

export default {
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
    data() {
        return {
            showModal: false,
            showVideo: true,
        };
    },
    mounted() {
        this.shouldShowVideo();
    },
    methods: {
        removeVideo() {
            if (confirm(this.$t("actions.delete_playlist_video_confirm"))) {
                this.$refs.removeButton.disabled = true;
                this.fetchJson(this.authApiUrl() + "/user/playlists/remove", null, {
                    method: "POST",
                    body: JSON.stringify({
                        playlistId: this.playlistId,
                        index: this.index,
                    }),
                    headers: {
                        Authorization: this.getAuthToken(),
                        "Content-Type": "application/json",
                    },
                }).then(json => {
                    if (json.error) alert(json.error);
                    else this.$emit("remove");
                });
            }
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
    components: { PlaylistAddModal },
};
</script>
