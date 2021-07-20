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
            <p>{{ video.title }}</p>
        </router-link>

        <div :class="{ 'uk-align-left': !(video.views >= 0 || video.uploadedDate) }">
            <div v-if="video.uploaderUrl && video.uploaderName && !hideChannel">
                <router-link class="uk-link-muted" :to="video.uploaderUrl">
                    <a>{{ video.uploaderName }}</a>
                </router-link>
                <br />
            </div>
        </div>

        <b v-if="video.views >= 0 || video.uploadedDate" class="uk-text-small uk-align-left">
            <div v-if="video.views >= 0">
                <font-awesome-icon icon="eye"></font-awesome-icon>
                {{ numberFormat(video.views) }} views
                <br />
            </div>
            <div v-if="video.uploadedDate">
                {{ video.uploadedDate }}
            </div>
        </b>
        <div class="uk-align-right">
            <b class="uk-text-small">{{ timeFormat(video.duration) }}</b>

            <br />

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
    hideChannel: Boolean
  }
}
</script>
