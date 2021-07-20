<template>
    <h1 class="uk-text-bold uk-text-center">Trending</h1>

    <hr />

    <div class="uk-grid-xl" uk-grid="parallax: 0">
        <div
            :style="[{ background: backgroundColor }]"
            class="uk-width-1-2 uk-width-1-3@s uk-width-1-4@m uk-width-1-5@l uk-width-1-6@xl"
            v-bind:key="video.url"
            v-for="video in videos"
        >
            <VideoItem :video="video" height="118" width="210" />
        </div>
    </div>
</template>

<script>
import VideoItem from '@/components/VideoItem.vue'

export default {
  data () {
    return {
      videos: []
    }
  },
  mounted () {
    document.title = 'Trending - Piped'

    const region = this.getPreferenceString('region', 'US')

    this.fetchTrending(region).then(videos => (this.videos = videos))
  },
  methods: {
    async fetchTrending (region) {
      return await this.fetchJson(this.apiUrl() + '/trending', {
        region: region || 'US'
      })
    }
  },
  components: {
    VideoItem
  }
}
</script>
