<template>
    <div>
        <router-link :to="video.url">
            <img :height="height" :width="width" class="w-full" :src="video.thumbnail" alt="" loading="lazy" />
            <div class="relative text-sm">
                <span v-if="video.duration" class="thumbnail-overlay bottom-5px right-5px" style="padding: 0 5px">{{
                    timeFormat(video.duration)
                }}</span>
                <span v-if="video.watched" class="thumbnail-overlay bottom-5px left-5px" style="padding: 0 5px">{{
                    $t("video.watched")
                }}</span>
            </div>

            <div>
                <p
                    style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical"
                    class="my-2 overflow-hidden flex link"
                    :title="video.title"
                >
                    {{ video.title }}
                </p>
            </div>
        </router-link>

        <div class="float-right ml-0 mb-0 inline-block">
            <router-link
                :to="video.url + '&listen=1'"
                :aria-label="'Listen to ' + video.title"
                :title="'Listen to ' + video.title"
            >
                <font-awesome-icon icon="headphones"></font-awesome-icon>
            </router-link>
        </div>

        <div class="flex" style="flex-flow: row">
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
                    {{ video.uploaderName
                    }}<font-awesome-icon class="ml-1.5" v-if="video.uploaderVerified" icon="check"></font-awesome-icon>
                </router-link>

                <strong v-if="video.views >= 0 || video.uploadedDate" class="uk-text-small">
                    <span v-if="video.views >= 0">
                        <font-awesome-icon icon="eye"></font-awesome-icon>
                        {{ numberFormat(video.views) }} •
                    </span>
                    <span v-if="video.uploadedDate">
                        {{ video.uploadedDate }}
                    </span>
                    <span v-if="video.uploaded">
                        {{ timeAgo(video.uploaded) }}
                    </span>
                </strong>
            </div>
        </div>
    </div>
</template>

<style>
.thumbnail-overlay {
    @apply rounded-md absolute bg-black bg-opacity-75;
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
