<script>
export default {
    props: {
        link: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            required: false,
            default: "YouTube",
        },
    },
};
</script>

<template>
    <template v-if="getPreferenceBoolean('showWatchOnYouTube', false)">
        <a :href="link" role="button" class="pp-square flex items-center" style="margin: 0; padding: 0">
            <i v-if="platform == 'YouTube'" class="i-fa6-brands:youtube m-0" />
            <i v-else-if="platform == 'Odysee'" class="i-fa6-brands:odysee m-0" />
        </a>
    </template>
</template>
