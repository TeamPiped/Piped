<template>
    <VideoItem v-if="shouldUseVideoItem(contentItem)" :video="contentItem" height="94" width="168" />
    <div v-else>
        <router-link :to="contentItem.url">
            <div class="relative">
                <img class="w-full" :src="contentItem.thumbnail" loading="lazy" />
            </div>
            <p>
                <span v-text="contentItem.name" />
                <font-awesome-icon class="ml-1.5" v-if="contentItem.verified" icon="check" />
            </p>
        </router-link>
        <p v-if="contentItem.description" v-text="contentItem.description" />
        <router-link v-if="contentItem.uploaderUrl" class="link" :to="contentItem.uploaderUrl">
            <p>
                <span v-text="contentItem.uploader" />
                <font-awesome-icon class="ml-1.5" v-if="contentItem.uploaderVerified" icon="check" />
            </p>
        </router-link>

        <a v-if="contentItem.uploaderName" class="link" v-text="contentItem.uploaderName" />
        <template v-if="contentItem.videos >= 0">
            <br v-if="contentItem.uploaderName" />
            <strong v-text="`${contentItem.videos} ${$t('video.videos')}`" />
        </template>

        <br />
    </div>
</template>

<script>
import VideoItem from "./VideoItem.vue";

export default {
    components: {
        VideoItem,
    },
    props: {
        contentItem: {
            type: Object,
            default: () => {
                return {};
            },
        },
    },
    methods: {
        shouldUseVideoItem(item) {
            return item.title;
        },
    },
};
</script>
