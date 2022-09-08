<template>
    <ModalComponent>
        <h2 v-t="'actions.share'" />
        <div class="flex justify-between mt-4">
            <label v-t="'actions.with_timecode'" for="withTimeCode" />
            <input id="withTimeCode" type="checkbox" v-model="withTimeCode" />
        </div>
        <div class="flex justify-between">
            <label v-t="'actions.piped_link'" />
            <input type="checkbox" v-model="pipedLink" />
        </div>
        <div class="flex justify-between mt-2">
            <label v-t="'actions.time_code'" />
            <input class="input w-12" type="text" v-model="timeStamp" />
        </div>
        <a :href="generatedLink" target="_blank"><h3 class="mt-4" v-text="generatedLink" /></a>
        <div class="flex justify-end mt-4">
            <button class="btn" v-t="'actions.follow_link'" @click="followLink()" />
            <button class="btn ml-3" v-t="'actions.copy_link'" @click="copyLink()" />
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    props: {
        videoId: {
            type: String,
            required: true,
        },
        currentTime: {
            type: Number,
            required: true,
        },
    },
    components: {
        ModalComponent,
    },
    data() {
        return {
            withTimeCode: true,
            pipedLink: true,
            timeStamp: null,
        };
    },
    mounted() {
        this.timeStamp = parseInt(this.currentTime);
    },
    methods: {
        followLink() {
            window.open(this.generatedLink, "_blank").focus();
        },
        async copyLink() {
            await this.copyURL(this.generatedLink);
        },
        async copyURL(mytext) {
            try {
                await navigator.clipboard.writeText(mytext);
                alert(this.$t("info.copied"));
            } catch ($e) {
                alert(this.$t("info.cannot_copy"));
            }
        },
    },
    computed: {
        generatedLink() {
            var baseUrl = this.pipedLink
                ? window.location.origin + "/watch?v=" + this.videoId
                : "https://youtu.be/" + this.videoId;
            var url = new URL(baseUrl);
            if (this.withTimeCode && this.timeStamp > 0) url.searchParams.append("t", this.timeStamp);
            return url.href;
        },
    },
};
</script>
