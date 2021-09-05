<template>
    <div class="uk-text-secondary" :style="[{ background: backgroundColor }]">
        <router-link class="uk-text-emphasis" v-bind:to="video.url">
            <img
                :height="height"
                :width="width"
                style="width: 100%"
                v-bind:src="video.thumbnail"
                alt="thumbnail"
                loading="lazy"
            />
            <div class="uk-position-relative">
                <span
                    v-if="video.duration"
                    class="uk-label uk-border-rounded uk-position-absolute video-duration"
                    style="bottom: 5px; right: 5px; background: rgba(0, 0, 0, .75); color: white; padding: 0 5px;"
                    >{{ timeFormat(video.duration) }}</span
                >
                <span
                    v-if="video.watched"
                    class="uk-label uk-border-rounded uk-position-absolute video-duration"
                    style="bottom: 5px; left: 5px; background: rgba(0, 0, 0, .75); color: white; padding: 0 5px;"
                    >{{ $t("video.watched") }}</span
                >
            </div>

            <div>
                <p class="uk-text-break" style="padding-top: 0.5rem; margin-bottom: 0.5rem">{{ video.title }}</p>
            </div>
        </router-link>

        <div class="uk-align-right" style="margin-left: 0; margin-bottom: 0; display: inline-block; width: 10%">
            <router-link :to="video.url + '&listen=1'">
                <font-awesome-icon icon="headphones"></font-awesome-icon>
            </router-link>
        </div>

        <div v-if="video.uploaderUrl && video.uploaderName && !hideChannel" style="display: flex; flex-flow: row; height: 15%">
            <router-link class="uk-link-muted" :to="video.uploaderUrl">
                <img v-if="video.uploaderAvatar" :src="video.uploaderAvatar" loading="lazy" class="uk-border-circle" style="margin-right: 0.5rem; margin-top:0.5rem; width: 32px; height: 32px;" />
            </router-link>

            <div>
                <router-link class="uk-link-muted" :to="video.uploaderUrl">
                    {{ video.uploaderName }}&thinsp;<font-awesome-icon
                        v-if="video.uploaderVerified"
                        icon="check"
                    ></font-awesome-icon>
                </router-link>

                <br />

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

<script>
export default {
    props: {
        video: Object,
        height: String,
        width: String,
        hideChannel: Boolean,
    },
};
</script>
