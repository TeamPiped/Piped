<template>
    <ModalComponent>
        <h2 v-t="'actions.share'" class="mb-5" />
        <div class="flex justify-between">
            <label v-t="'actions.piped_link'" />
            <input v-model="pipedLink" type="checkbox" @change="onChange" />
        </div>
        <hr />
        <div v-if="hasPlaylist" class="flex justify-between">
            <label v-t="'actions.with_playlist'" />
            <input v-model="withPlaylist" type="checkbox" @change="onChange" />
        </div>
        <div class="flex justify-between">
            <label v-t="'actions.with_timecode'" for="withTimeCode" />
            <input id="withTimeCode" v-model="withTimeCode" type="checkbox" @change="onChange" />
        </div>
        <div v-if="withTimeCode" class="mt-2 flex items-center justify-between">
            <label v-t="'actions.time_code'" />
            <input v-model="timeStamp" class="input w-12" type="text" @change="onChange" />
        </div>
        <hr />
        <a :href="generatedLink" target="_blank">
            <h3 class="mt-4" v-text="generatedLink" />
        </a>
        <QrCode v-if="showQrCode" :text="generatedLink" />
        <div class="mt-4 flex justify-end">
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
            durations: [1, 60, 60 * 60, 60 * 60 * 24],
        };
    },
    computed: {
        generatedLink() {
            const baseUrl = this.pipedLink
                ? window.location.origin + "/watch?v=" + this.videoId
                : "https://youtu.be/" + this.videoId;
            const url = new URL(baseUrl);

            if (this.withTimeCode && this.timeStamp)
                url.searchParams.append("t", this.parseTimeStampToSeconds(this.timeStamp));

            if (this.hasPlaylist && this.withPlaylist) {
                url.searchParams.append("list", this.playlistId);
                url.searchParams.append("index", this.playlistIndex);
            }

            return url.href;
        },
    },
    mounted() {
        this.timeStamp = this.parseSecondsToTimeStamp(this.currentTime ?? 0);
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
        parseTimeStampToSeconds(timestamp) {
            const timeArray = timestamp.split(":").reverse();
            let seconds = 0;
            for (let i = 0; i < timeArray.length; i++) {
                seconds += timeArray[i] * this.durations[i];
            }
            return seconds;
        },
        parseSecondsToTimeStamp(seconds) {
            const timeArray = [];
            const durationsReversed = this.durations.toReversed();
            for (let i in durationsReversed) {
                const currentValue = Math.floor(seconds / durationsReversed[i]);
                if (currentValue > 0) {
                    timeArray.push(currentValue.toString().padStart(2, "0"));
                    seconds -= currentValue * durationsReversed[i];
                }
            }
            return timeArray.join(":");
        },
        onChange() {
            this.setPreference("shareWithTimeCode", this.withTimeCode, true);
            this.setPreference("shareAsPipedLink", this.pipedLink, true);
            this.setPreference("shareWithPlaylist", this.withPlaylist, true);
        },
    },
};
</script>
