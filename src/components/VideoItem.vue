<template>
    <div>
        <router-link :to="video.url">
            <img :height="height" :width="width" class="w-full" :src="video.thumbnail" alt="" loading="lazy" />
            <div class="relative text-sm">
                <span
                    class="thumbnail-overlay thumbnail-right"
                    v-if="video.duration > 0"
                    v-text="timeFormat(video.duration)"
                />
                <i18n-t v-else keypath="video.live" class="thumbnail-overlay thumbnail-right !bg-red-600" tag="div">
                    <font-awesome-icon class="!w-3" :icon="['fas', 'broadcast-tower']" />
                </i18n-t>
                <span v-if="video.watched" class="thumbnail-overlay bottom-5px left-5px" v-t="'video.watched'" />
            </div>

            <div>
                <p
                    style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                    class="my-2 overflow-hidden flex link"
                    :title="video.title"
                    v-text="video.title"
                />
            </div>
        </router-link>

        <div class="float-right m-0 inline-block">
            <router-link
                :to="video.url + '&listen=1'"
                :aria-label="'Listen to ' + video.title"
                :title="'Listen to ' + video.title"
            >
                <font-awesome-icon icon="headphones" />
            </router-link>
        </div>

        <div class="flex">
            <router-link :to="video.uploaderUrl">
                <img
                    v-if="video.uploaderAvatar"
                    :src="video.uploaderAvatar"
                    loading="lazy"
                    :alt="video.uploaderName"
                    class="rounded-full mr-0.5 mt-0.5 w-32px h-32px"
                    width="68"
                    height="68"
                />
            </router-link>

            <div class="w-[calc(100%-32px-1rem)]">
                <router-link
                    v-if="video.uploaderUrl && video.uploaderName && !hideChannel"
                    class="link-secondary overflow-hidden block"
                    :to="video.uploaderUrl"
                    :title="video.uploaderName"
                >
                    <span v-text="video.uploaderName" />
                    <font-awesome-icon class="ml-1.5" v-if="video.uploaderVerified" icon="check" />
                </router-link>

                <strong v-if="video.views >= 0 || video.uploadedDate" class="text-sm">
                    <span v-if="video.views >= 0">
                        <font-awesome-icon icon="eye" />
                        <span class="pl-0.5" v-text="`${numberFormat(video.views)} •`" />
                    </span>
                    <span v-if="video.uploaded > 0" class="pl-0.5" v-text="timeAgo(video.uploaded)" />
                    <span v-else-if="video.uploadedDate" class="pl-0.5" v-text="video.uploadedDate" />
                </strong>
            </div>
        </div>
    </div>
</template>

<style>
.thumbnail-overlay {
    @apply rounded-md absolute bg-black text-white bg-opacity-75 px-5px;
}

.thumbnail-right {
    @apply bottom-5px right-5px;
}
</style>

<script>
export default {
    props: {
        video: {
            type: Object,
            default: () => {
                return {};
            },
        },
        height: { type: String, default: "118" },
        width: { type: String, default: "210" },
        hideChannel: { type: Boolean, default: false },
    },
};
</script>
