<template>
    <ErrorHandler v-if="playlist && playlist.error" :message="playlist.message" :error="playlist.error" />

    <div v-if="playlist" v-show="!playlist.error">
        <h1 class="uk-text-center">
            <img v-bind:src="playlist.avatarUrl" height="48" width="48" loading="lazy" />
            {{ playlist.name }}
        </h1>

        <b
            ><router-link class="uk-text-justify" v-bind:to="playlist.uploaderUrl || '/'">
                <img v-bind:src="playlist.uploaderAvatar" loading="lazy" />
                {{ playlist.uploader }}</router-link
            ></b
        >

        <div class="uk-align-right">
            <b>{{ playlist.videos }} Videos</b>
            <br />
            <a :href="getRssUrl"><font-awesome-icon icon="rss"></font-awesome-icon></a>
        </div>

        <hr />

        <div class="uk-grid-xl" uk-grid="parallax: 0">
            <div
                class="uk-width-1-2 uk-width-1-3@m uk-width-1-4@l uk-width-1-5@xl"
                v-bind:key="video.url"
                v-for="video in this.playlist.relatedStreams"
            >
                <VideoItem :video="video" height="94" width="168" />
            </div>
        </div>
    </div>
</template>

<script>
import ErrorHandler from '@/components/ErrorHandler.vue'
import VideoItem from '@/components/VideoItem.vue'

export default {
  data () {
    return {
      playlist: null
    }
  },
  mounted () {
    this.getPlaylistData()
  },
  activated () {
    window.addEventListener('scroll', this.handleScroll)
  },
  deactivated () {
    window.removeEventListener('scroll', this.handleScroll)
  },
  computed: {
    getRssUrl: _this => {
      return _this.apiUrl() + '/rss/playlists/' + _this.$route.query.list
    }
  },
  methods: {
    async fetchPlaylist () {
      return await await this.fetchJson(this.apiUrl() + '/playlists/' + this.$route.query.list)
    },
    async getPlaylistData () {
      this.fetchPlaylist()
        .then(data => (this.playlist = data))
        .then(() => (document.title = this.playlist.name + ' - Piped'))
    },
    handleScroll () {
      if (this.loading || !this.playlist || !this.playlist.nextpage) return
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - window.innerHeight) {
        this.loading = true
        this.fetchJson(this.apiUrl() + '/nextpage/playlists/' + this.$route.query.list, {
          nextpage: this.playlist.nextpage
        }).then(json => {
          this.playlist.relatedStreams.concat(json.relatedStreams)
          this.playlist.nextpage = json.nextpage
          this.loading = false
          json.relatedStreams.map(stream => this.playlist.relatedStreams.push(stream))
        })
      }
    }
  },
  components: {
    ErrorHandler,
    VideoItem
  }
}
</script>
