<template>
    <ModalComponent>
        <h5 v-t="'actions.share'" />
        <div class="flex justify-between mt-2 mb-2">
            <label v-t="'actions.piped_link'" />
            <input v-model="pipedLink" type="checkbox" @change="onChange" />
        </div>
        <div v-if="hasPlaylist" class="flex justify-between">
            <label v-t="'actions.with_playlist'" />
            <input v-model="withPlaylist" type="checkbox" @change="onChange" />
        </div>
        <div class="flex justify-between">
            <label v-t="'actions.with_timecode'" for="withTimeCode" />
            <input id="withTimeCode" v-model="withTimeCode" type="checkbox" @change="onChange" />
        </div>
        <div v-if="withTimeCode" class="flex justify-between mt-2" style="align-items: center">
            <label v-t="'actions.time_code'" />
            <input v-model="timeStamp" style="max-width: 100rem" type="number" @change="onChange" />
        </div>
        <a :href="generatedLink" target="_blank">
            <h6 class="mb-2 mt-2" v-text="generatedLink" />
        </a>
        <QrCode v-if="showQrCode" :text="generatedLink" class="mb-[10rem]" />
        <div class="flex flex-wrap justify-end" style="gap: var(--efy_gap0)">
            <button v-t="'actions.generate_qrcode'" class="btn" @click="showQrCode = !showQrCode" />
            <button v-t="'actions.follow_link'" class="btn ml-3" @click="followLink()" />
            <button v-t="'actions.copy_link'" class="btn ml-3" @click="copyLink()" />
        </div>
    </ModalComponent>
</template>

<script setup>
import { defineAsyncComponent } from "vue";

const QrCode = defineAsyncComponent(() => import("./QrCode.vue"));
</script>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ModalComponent,
    },
    props: {
        videoId: {
            type: String,
            required: true,
        },
        currentTime: {
            type: Number,
            required: true,
        },
        playlistId: {
            type: String,
            default: undefined,
        },
        playlistIndex: {
            type: Number,
            default: undefined,
        },
    },
    data() {
        return {
            withTimeCode: true,
            pipedLink: true,
            withPlaylist: true,
            timeStamp: null,
            hasPlaylist: false,
            showQrCode: false,
        };
    },
    computed: {
        generatedLink() {
            var baseUrl = this.pipedLink
                ? window.location.origin + "/watch?v=" + this.videoId
                : "https://youtu.be/" + this.videoId;
            var url = new URL(baseUrl);
            if (this.withTimeCode && this.timeStamp > 0) url.searchParams.append("t", this.timeStamp);
            if (this.hasPlaylist && this.withPlaylist) {
                url.searchParams.append("list", this.playlistId);
                url.searchParams.append("index", this.playlistIndex);
            }
            return url.href;
        },
    },
    mounted() {
        this.timeStamp = parseInt(this.currentTime);
        this.withTimeCode = this.getPreferenceBoolean("shareWithTimeCode", true);
        this.pipedLink = this.getPreferenceBoolean("shareAsPipedLink", true);
        this.withPlaylist = this.getPreferenceBoolean("shareWithPlaylist", true);
        this.hasPlaylist = this.playlistId != undefined && !isNaN(this.playlistIndex);
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
        onChange() {
            this.setPreference("shareWithTimeCode", this.withTimeCode, true);
            this.setPreference("shareAsPipedLink", this.pipedLink, true);
            this.setPreference("shareWithPlaylist", this.withPlaylist, true);
        },
    },
};
</script>
