<template>
    <div class="comment flex mt-1.5">
        <router-link style="height: fit-content" :to="comment.commentorUrl">
            <img :src="comment.thumbnail" class="comment-avatar" height="48" width="48" loading="lazy" alt="Avatar" />
        </router-link>

        <div class="comment-content pl-2">
            <div class="comment-header">
                <div v-if="comment.pinned" class="comment-pinned">
                    <font-awesome-icon icon="thumbtack" />
                    <span
                        v-t="{
                            path: 'comment.pinned_by',
                            args: { author: uploader },
                        }"
                        class="ml-1.5"
                    />
                </div>

                <div class="comment-author flex align-center">
                    <router-link class="link font-bold" :to="comment.commentorUrl">{{ comment.author }}</router-link>
                    <font-awesome-icon v-if="comment.verified" class="ml-1.5" icon="check" />
                    <div class="comment-meta mb-1.5" v-text="' • ' + comment.commentedTime + ' •'" />
                    <div class="comment-footer mt-1 flex items-center">
                        <div class="i-fa6-solid:thumbs-up" />
                        <span class="ml-1" v-text="numberFormat(comment.likeCount)" />
                        <font-awesome-icon v-if="comment.hearted" class="ml-1" icon="heart" />
                    </div>
                </div>
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="whitespace-pre-wrap" v-html="purifiedText" />
            <template v-if="comment.repliesPage && (!loadingReplies || !showingReplies)">
                <div class="cursor-pointer" @click="loadReplies">
                    <a v-text="`${$t('actions.reply_count', comment.replyCount)}`" />
                    <font-awesome-icon class="ml-1.5" icon="level-down-alt" />
                </div>
            </template>
            <template v-if="showingReplies">
                <div class="cursor-pointer" @click="hideReplies">
                    <a v-t="'actions.hide_replies'" />
                    <font-awesome-icon class="ml-1.5" icon="level-up-alt" />
                </div>
            </template>
            <div v-show="showingReplies" v-if="replies" class="replies">
                <div v-for="reply in replies" :key="reply.commentId" class="w-full">
                    <CommentItem :comment="reply" :uploader="uploader" :video-id="videoId" />
                </div>
                <div v-if="nextpage" class="cursor-pointer" @click="loadReplies">
                    <a v-t="'actions.load_more_replies'" />
                    <font-awesome-icon class="ml-1.5" icon="level-down-alt" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { purifyHTML } from "@/utils/HtmlUtils";

export default {
    props: {
        comment: {
            type: Object,
            default: () => {
                return {};
            },
        },
        uploader: { type: String, default: null },
        videoId: { type: String, default: null },
    },
    data() {
        return {
            loadingReplies: false,
            showingReplies: false,
            replies: [],
            nextpage: null,
        };
    },
    computed: {
        purifiedText() {
            return purifyHTML(this.comment.commentText);
        },
    },
    methods: {
        async loadReplies() {
            if (!this.showingReplies && this.loadingReplies) {
                this.showingReplies = true;
                return;
            }

            this.loadingReplies = true;
            this.showingReplies = true;
            this.fetchJson(this.apiUrl() + "/nextpage/comments/" + this.videoId, {
                nextpage: this.nextpage || this.comment.repliesPage,
            }).then(json => {
                this.replies = this.replies.concat(json.comments);
                this.nextpage = json.nextpage;
            });
        },
        async hideReplies() {
            this.showingReplies = false;
        },
    },
};
</script>

<style>
.comment-content {
    overflow-wrap: anywhere;
}
.comment-avatar {
    max-width: unset;
}
</style>
