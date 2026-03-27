<template>
    <div class="mt-1.5 flex">
        <img loading="lazy" :src="comment.thumbnail" class="size-12 rounded-full" height="48" width="48" alt="Avatar" />

        <div class="pl-2">
            <div>
                <div v-if="comment.pinned">
                    <i-fa6-solid-thumbtack />
                    <span
                        v-t="{
                            path: 'comment.pinned_by',
                            args: { author: uploader },
                        }"
                        class="ml-1.5"
                    />
                </div>

                <div>
                    <router-link
                        class="font-bold hover:text-red-500 focus:text-red-500 dark:hover:text-red-400 dark:focus:text-red-400"
                        :to="comment.commentorUrl"
                        >{{ comment.author }}</router-link
                    >
                    <i-fa6-solid-check v-if="comment.verified" class="ml-1.5" />
                </div>
                <div class="mb-1.5 text-sm" v-text="comment.commentedTime" />
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <CollapsableText :text="comment.commentText" :visible-limit="500" />
            <div class="my-1 flex items-center gap-3">
                <i-fa6-solid-thumbs-up />
                <span v-text="numberFormat(comment.likeCount)" />
                <i-fa6-solid-heart v-if="comment.hearted" :title="$t('actions.creator_liked')" />
                <img
                    v-if="comment.creatorReplied"
                    :src="uploaderAvatarUrl"
                    class="size-5 rounded-full"
                    :title="$t('actions.creator_replied')"
                />
            </div>
            <template v-if="comment.repliesPage && (!loadingReplies || !showingReplies)">
                <div class="cursor-pointer" @click="loadReplies">
                    <a v-text="`${$t('actions.reply_count', comment.replyCount)}`" />
                    <i-fa6-solid-turn-down class="ml-1.5" />
                </div>
            </template>
            <template v-if="showingReplies">
                <div class="cursor-pointer" @click="hideReplies">
                    <a v-t="'actions.hide_replies'" />
                    <i-fa6-solid-turn-up class="ml-1.5" />
                </div>
            </template>
            <div v-show="showingReplies" v-if="replies">
                <div v-for="reply in replies" :key="reply.commentId" class="w-full">
                    <!-- eslint-disable-next-line vue/no-undef-components -->
                    <CommentItem :comment="reply" :uploader="uploader" :video-id="videoId" />
                </div>
                <div v-if="nextpage" class="cursor-pointer" @click="loadReplies">
                    <a v-t="'actions.load_more_replies'" />
                    <i-fa6-solid-turn-down class="ml-1.5" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import CollapsableText from "./CollapsableText.vue";
import { fetchJson, apiUrl } from "@/composables/useApi.js";
import { numberFormat } from "@/composables/useFormatting.js";

const props = defineProps({
    comment: {
        type: Object,
        default: () => {
            return {};
        },
    },
    uploader: { type: String, default: null },
    uploaderAvatarUrl: { type: String, default: null },
    videoId: { type: String, default: null },
});

const loadingReplies = ref(false);
const showingReplies = ref(false);
const replies = ref([]);
const nextpage = ref(null);

async function loadReplies() {
    if (!showingReplies.value && loadingReplies.value) {
        showingReplies.value = true;
        return;
    }
    loadingReplies.value = true;
    showingReplies.value = true;
    fetchJson(apiUrl() + "/nextpage/comments/" + props.videoId, {
        nextpage: nextpage.value || props.comment.repliesPage,
    }).then(json => {
        replies.value = replies.value.concat(json.comments);
        nextpage.value = json.nextpage;
    });
}

async function hideReplies() {
    showingReplies.value = false;
}
</script>
