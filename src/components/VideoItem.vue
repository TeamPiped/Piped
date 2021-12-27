<template>
    <div class="uk-text-secondary" :style="[{ background: backgroundColor }]">
        <router-link class="uk-text-emphasis" :to="video.url">
            <img :height="height" :width="width" style="width: 100%" :src="video.thumbnail" alt="" loading="lazy" />
            <div class="relative">
                <span v-if="video.duration" class="thumbnail-overlay bottom-5px right-5px" style="padding: 0 5px">{{
                    timeFormat(video.duration)
                }}</span>
                <span v-if="video.watched" class="thumbnail-overlay bottom-5px left-5px" style="padding: 0 5px">{{
                    $t("video.watched")
                }}</span>
            </div>

            <div>
                <p
                    style="
                        padding-top: 0.5rem;
                        margin-bottom: 0.5rem;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    "
                    :title="video.title"
                >
                    {{ video.title }}
                </p>
            </div>
        </router-link>

        <div class="float-right" style="margin-left: 0; margin-bottom: 0; display: inline-block; width: 10%">
            <router-link
                :to="video.url + '&listen=1'"
                :aria-label="'Listen to ' + video.title"
                :title="'Listen to ' + video.title"
            >
                <font-awesome-icon icon="headphones"></font-awesome-icon>
            </router-link>
        </div>

        <div style="display: flex; flex-flow: row; height: 15%">
            <router-link class="uk-link-muted" :to="video.uploaderUrl">
                <img
                    v-if="video.uploaderAvatar"
                    :src="video.uploaderAvatar"
                    loading="lazy"
                    :alt="video.uploaderName"
                    class="rounded-full mr-0.5 mt-0.5 w-32px h-32px"
                />
            </router-link>

            <div class="w-[calc(100%-32px-1rem)]">
                <router-link
                    v-if="video.uploaderUrl && video.uploaderName && !hideChannel"
                    class="uk-link-muted overflow-hidden block"
                    :to="video.uploaderUrl"
                    :title="video.uploaderName"
                    style="display: block; width: 90%"
                >
                    {{ video.uploaderName }}&thinsp;<font-awesome-icon
                        v-if="video.uploaderVerified"
                        icon="check"
                    ></font-awesome-icon>
                </router-link>

                <b v-if="video.views >= 0 || video.uploadedDate" class="uk-text-small">
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
                </b>
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
