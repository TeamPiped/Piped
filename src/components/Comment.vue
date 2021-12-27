<template>
    <div class="comment flex mt-1.5">
        <img
            :src="comment.thumbnail"
            class="comment-avatar rounded-full w-12 h-12"
            height="48"
            width="48"
            loading="lazy"
            alt="Avatar"
        />

        <div class="comment-content pl-2">
            <div class="comment-header">
                <div v-if="comment.pinned" class="comment-pinned uk-text-meta">
                    <font-awesome-icon icon="thumbtack" />
                    <span class="ml-1.5" v-text="$t('comment.pinned_by')" />
                    <span v-text="uploader" />
                </div>

                <div class="comment-author">
                    <router-link class="font-bold uk-text-small" :to="comment.commentorUrl" v-text="comment.author" />
                    <font-awesome-icon class="ml-1.5" v-if="comment.verified" icon="check" />
                </div>
                <div class="comment-meta uk-text-meta uk-margin-small-bottom" v-text="comment.commentedTime" />
            </div>
            <div class="whitespace-pre-wrap" v-text="comment.commentText" />
            <div class="comment-footer uk-margin-small-top uk-text-meta">
                <font-awesome-icon icon="thumbs-up" />
                <span class="ml-1" v-text="numberFormat(comment.likeCount)" />
                <font-awesome-icon class="ml-1" v-if="comment.hearted" icon="heart" />
            </div>
            <template v-if="comment.repliesPage && (!loadingReplies || !showingReplies)">
                <div @click="loadReplies">
                    <a class="uk-link-text" v-t="'actions.show_replies'" />
                    <font-awesome-icon class="ml-1.5" icon="level-down-alt" />
                </div>
            </template>
            <template v-if="showingReplies">
                <div @click="hideReplies">
                    <a class="uk-link-text" v-t="'actions.hide_replies'" />
                    <font-awesome-icon class="ml-1.5" icon="level-up-alt" />
                </div>
            </template>
            <div v-show="showingReplies" v-if="replies" class="replies">
                <div v-for="reply in replies" :key="reply.commentId" class="w-full">
                    <Comment :comment="reply" :uploader="uploader" :video-id="videoId" />
                </div>
                <div v-if="nextpage" @click="loadReplies">
                    <a class="uk-link-text" v-t="'actions.load_more_replies'" />
                    <font-awesome-icon class="ml-1.5" icon="level-down-alt" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
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
