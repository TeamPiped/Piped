<template>
  <div class="comment uk-flex">
    <img
        :src="comment.thumbnail"
        class="comment-avatar uk-border-circle uk-margin-right"
        style="width: 48px; height: 48px;"
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
          <router-link class="uk-text-bold uk-text-small" v-bind:to="comment.commentorUrl">
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
          <font-awesome-icon icon="thumbs-up" style="margin-right: 4px;"></font-awesome-icon>
          <span>{{ numberFormat(comment.likeCount) }}</span>
          &nbsp;
          <font-awesome-icon v-if="comment.hearted" icon="heart"></font-awesome-icon>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      comment: Object,
      uploader: String
    }
  }
</script>