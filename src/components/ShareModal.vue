<template>
    <div class="modal">
        <div>
            <div class="modal-container">
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
                <h3 class="mt-4" v-text="generatedLink" />
                <div class="flex justify-end mt-4">
                    <button class="btn" v-t="'actions.follow_link'" @click="followLink()" />
                    <button class="btn ml-3" v-t="'actions.copy_link'" @click="copyLink()" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
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
    data() {
        return {
            withTimeCode: true,
            pipedLink: true,
            timeStamp: null,
        };
    },
    mounted() {
        window.addEventListener("keydown", this.handleKeyDown);
        this.timeStamp = parseInt(this.currentTime);
    },
    unmounted() {
        window.removeEventListener("keydown", this.handleKeyDown);
    },
    methods: {
        handleKeyDown(event) {
            if (event.code === "Escape") {
                this.$emit("close");
            } else return;
            event.preventDefault();
        },
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
            var href = this.pipedLink
                ? window.location.origin + "/watch?v=" + this.videoId
                : "https://youtu.be/" + this.videoId;
            if (this.withTimeCode && this.timeStamp) href += "?t=" + this.timeStamp;
            return href;
        },
    },
};
</script>

<style scoped>
.modal {
    @apply fixed z-50 top-0 left-0 w-full h-full bg-dark-900 bg-opacity-80 transition-opacity table;
}

.modal > div {
    @apply table-cell align-middle;
}

.modal-container {
    @apply w-100 m-auto px-8 bg-dark-700 p-5 flex flex-col rounded-xl;
}
</style>
