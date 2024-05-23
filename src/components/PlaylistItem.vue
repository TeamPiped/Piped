<template>
    <div class="efy_shadow_trans video-card flex flex-col flex-justify-between">
        <router-link :to="props.item.url">
            <div class="relative">
                <img class="thumbnail" :src="props.item.thumbnail" loading="lazy" />
            </div>
            <div class="h-[44rem] flex items-center overflow-hidden">
                <p class="pp-video-card-title" v-text="props.item.name" />
            </div>
        </router-link>
        <p v-if="props.item.description" v-text="props.item.description" />

        <div class="pp-video-card-buttons">
            <button
                v-if="props.item.videos >= 0"
                class="efy_shadow_trans efy_shadow_button_off efy_button_text_off"
                v-text="`${props.item.videos} ${$t('video.videos')}`"
            />
            <router-link
                v-if="props.item.uploaderUrl && item.uploaderName"
                :to="props.item.uploaderUrl"
                :title="props.item.uploaderName"
                class="pp-video-card-channel"
                style="padding: 0; flex-grow: 1; background: transparent; border: 0"
            >
                <div class="pp-text efy_shadow_trans efy_shadow_button_off flex-grow-1">
                    <span style="max-width: 106rem" v-text="props.item.uploaderName" />
                    <i v-if="item.uploaderVerified" class="i-fa6-solid:check ml-2" />
                </div>
            </router-link>
            <a
                v-else-if="props.item.uploaderName"
                class="pp-video-card-channel efy_shadow_trans"
                v-text="props.item.uploaderName"
            />
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    item: {
        type: Object,
        required: true,
    },
});
</script>
