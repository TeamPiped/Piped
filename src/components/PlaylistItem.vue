<template>
    <div>
        <router-link :to="props.item.url">
            <div class="relative">
                <img class="w-full" :src="props.item.thumbnail" loading="lazy" />
            </div>
            <p>
                <span v-text="props.item.name" />
                <font-awesome-icon class="ml-1.5" v-if="props.item.verified" icon="check" />
            </p>
        </router-link>
        <p v-if="props.item.description" v-text="props.item.description" />
        <router-link v-if="props.item.uploaderUrl" class="link" :to="props.item.uploaderUrl">
            <p>
                <span v-text="props.item.uploader" />
                <font-awesome-icon class="ml-1.5" v-if="props.item.uploaderVerified" icon="check" />
            </p>
        </router-link>

        <a v-if="props.item.uploaderName" class="link" v-text="props.item.uploaderName" />
        <template v-if="props.item.videos >= 0">
            <br v-if="props.item.uploaderName" />
            <strong v-text="`${props.item.videos} ${$t('video.videos')}`" />
        </template>

        <br />
    </div>
</template>

<script setup>
const props = defineProps({
    item: Object,
});
</script>
