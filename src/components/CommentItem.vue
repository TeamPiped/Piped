<template>
    <div class="comment mt-1.5 flex">
        <img
            loading="lazy"
            :src="comment.thumbnail"
            class="comment-avatar h-12 w-12 rounded-full"
            height="48"
            width="48"
            alt="Avatar"
        />

        <div class="comment-content pl-2">
            <div class="comment-header">
                <div v-if="comment.pinned" class="comment-pinned">
                    <i class="i-fa6-solid:thumbtack" />
                    <span
                        v-t="{
                            path: 'comment.pinned_by',
                            args: { author: uploader },
                        }"
                        class="ml-1.5"
                    />
                </div>

                <div class="comment-author">
                    <router-link class="link font-bold" :to="comment.commentorUrl">{{ comment.author }}</router-link>
                    <i v-if="comment.verified" class="i-fa6-solid:check ml-1.5" />
                </div>
                <div class="comment-meta mb-1.5 text-sm" v-text="comment.commentedTime" />
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <CollapsableText :text="comment.commentText" :visible-limit="500" />
            <div class="comment-footer my-1 flex items-center gap-3">
                <div class="i-fa6-solid:thumbs-up" />
                <span v-text="numberFormat(comment.likeCount)" />
                <i v-if="comment.hearted" class="i-fa6-solid:heart" :title="$t('actions.creator_liked')" />
                <img
                    v-if="comment.creatorReplied"
                    :src="uploaderAvatarUrl"
                    class="h-5 w-5 rounded-full"
                    :title="$t('actions.creator_replied')"
                />
            </div>
            <template v-if="comment.repliesPage && (!loadingReplies || !showingReplies)">
                <div class="cursor-pointer" @click="loadReplies">
                    <a v-text="`${$t('actions.reply_count', comment.replyCount)}`" />
                    <i class="i-fa6-solid:level-down-alt ml-1.5" />
                </div>
            </template>
            <template v-if="showingReplies">
                <div class="cursor-pointer" @click="hideReplies">
                    <a v-t="'actions.hide_replies'" />
                    <i class="i-fa6-solid:level-up-alt ml-1.5" />
                </div>
            </template>
            <div v-show="showingReplies" v-if="replies" class="replies">
                <div v-for="reply in replies" :key="reply.commentId" class="w-full">
                    <!-- eslint-disable-next-line vue/no-undef-components -->
                    <CommentItem :comment="reply" :uploader="uploader" :video-id="videoId" />
                </div>
                <div v-if="nextpage" class="cursor-pointer" @click="loadReplies">
                    <a v-t="'actions.load_more_replies'" />
                    <i class="i-fa6-solid:level-down-alt ml-1.5" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import CollapsableText from "./CollapsableText.vue";

export default {
    components: { CollapsableText },
    props: {
        comment: {
            type: Object,
            default: () => {
                return {};
            },
        },
        uploader: { type: String, default: null },
        uploaderAvatarUrl: { type: String, default: null },
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
    methods: {
        async loadReplies() {
            console.log(this.uploaderAvatarUrl);
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
