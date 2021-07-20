<template>
    <h1 class="uk-text-bold uk-text-center">Feed</h1>

    <small>You can import subscriptions from <router-link to="/import">here</router-link>.</small>

    <div class="uk-align-right">
        <a :href="getRssUrl"><font-awesome-icon icon="rss"></font-awesome-icon></a>
    </div>

    <hr />

    <div class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            :style="[{ background: backgroundColor }]"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="video.url"
            v-for="video in videos"
        >
            <div class="uk-text-secondary" :style="[{ background: backgroundColor }]">
                <router-link class="uk-text-emphasis" v-bind:to="'/watch?v=' + video.id">
                    <img style="width: 100%" v-bind:src="video.thumbnail" alt="thumbnail" loading="lazy" />
                    <p>{{ video.title }}</p>
                </router-link>

                <div>
                    <div>
                        <router-link class="uk-link-muted" :to="'/channel/' + video.uploader_id">
                            <a>{{ video.uploader }}</a>
                        </router-link>
                        <br />
                    </div>
                </div>

                <b class="uk-text-small uk-align-left">
                    <div v-if="video.views >= 0">
                        <font-awesome-icon icon="eye"></font-awesome-icon>
                        {{ numberFormat(video.views) }} views
                        <br />
                    </div>
                    <div>
                        {{ timeAgo(video.uploaded) }}
                    </div>
                </b>
                <div class="uk-align-right">
                    <b class="uk-text-small">{{ timeFormat(video.duration) }}</b>

                    <br />

                    <router-link :to="'/watch?v=' + video.id + '&listen=1'">
                        <font-awesome-icon icon="headphones"></font-awesome-icon>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      videos: []
    }
  },
  mounted () {
    document.title = 'Feed - Piped'

    this.fetchFeed().then(videos => (this.videos = videos))
  },
  methods: {
    async fetchFeed () {
      return await this.fetchJson(this.apiUrl() + '/feed', {
        authToken: this.getAuthToken()
      })
    }
  },
  computed: {
    getRssUrl (_this) {
      return _this.apiUrl() + '/feed/rss?authToken=' + _this.getAuthToken()
    }
  }
}
</script>
