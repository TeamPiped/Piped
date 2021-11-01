<template>
    <div class="comment uk-flex">
        <img
            :src="comment.thumbnail"
            class="comment-avatar uk-border-circle uk-margin-right"
            height="48"
            width="48"
            style="width: 48px; height: 48px"
            loading="lazy"
            alt="Avatar"
        />

        <div class="comment-content">
            <div class="comment-header">
                <div v-if="comment.pinned" class="comment-pinned uk-text-meta">
                    <font-awesome-icon icon="thumbtack"></font-awesome-icon>&nbsp; {{ $t("comment.pinned_by") }}
                    {{ uploader }}
                </div>

                <div class="comment-author">
                    <router-link class="uk-text-bold uk-text-small" :to="comment.commentorUrl">
                        {{ comment.author }} </router-link
                    >&thinsp;<font-awesome-icon v-if="comment.verified" icon="check"></font-awesome-icon>
                </div>
                <div class="comment-meta uk-text-meta uk-margin-small-bottom">
                    {{ comment.commentedTime }}
                </div>
            </div>
            <div class="comment-body" style="white-space: pre-wrap">
                {{ comment.commentText }}
            </div>
            <div class="comment-footer uk-margin-small-top uk-text-meta">
                <font-awesome-icon icon="thumbs-up" style="margin-right: 4px"></font-awesome-icon>
                <span>{{ numberFormat(comment.likeCount) }}</span>
                &nbsp;
                <font-awesome-icon v-if="comment.hearted" icon="heart"></font-awesome-icon>
            </div>
            <div v-if="comment.repliesPage && notLoading">
                <div @click="loadReplies">
                    <a class="uk-link-text">Show Replies</a>
                    &nbsp;
                    <font-awesome-icon icon="level-down-alt"></font-awesome-icon>
                </div>
            </div>
            <div v-if="replies" class="replies uk-width-4-5@xl uk-width-3-4@s uk-width-1">
                <div
                    v-for="reply in replies"
                    :key="reply.commentId"
                    class="uk-tile-default uk-align-left uk-width-expand"
                    :style="[{ background: backgroundColor }]"
                >
                    <Comment :comment="reply" :uploader="uploader" :video-id="videoId" />
                </div>
                <div v-if="nextpage" @click="loadReplies">
                    <a class="uk-link-text">Load more Replies</a>
                    &nbsp;
                    <font-awesome-icon icon="level-down-alt"></font-awesome-icon>
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
            notLoading: true,
            replies: [],
            nextpage: null,
        };
    },
    methods: {
        loadReplies() {
            this.notLoading = false;
            this.fetchJson(this.apiUrl() + "/nextpage/comments/" + this.videoId, {
                nextpage: this.nextpage || this.comment.repliesPage,
            }).then(json => {
                this.replies = this.replies.concat(json.comments);
                this.nextpage = json.nextpage;
            });
        },
    },
};
</script>
