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
                    >Watched</span
                >
            </div>
            <p class="uk-text-break">{{ video.title }}</p>
        </router-link>

        <span v-if="video.uploaderUrl && video.uploaderName && !hideChannel">
            <router-link class="uk-link-muted" :to="video.uploaderUrl">
                <img :src="video.uploaderAvatar" loading="lazy" class="uk-border-circle" style="width: 15%; height: 15%"/>
                {{ video.uploaderName }}&thinsp;<font-awesome-icon
                    v-if="video.uploaderVerified"
                    icon="check"
                ></font-awesome-icon>
            </router-link>
            <br />
        </span>

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

        <div class="uk-align-right" style="margin-left: 0">
            <router-link :to="video.url + '&listen=1'">
                <font-awesome-icon icon="headphones"></font-awesome-icon>
            </router-link>
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
