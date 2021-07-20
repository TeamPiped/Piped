<template>
    <h1 class="uk-text-bold uk-text-center">Preferences</h1>
    <hr />
    <h2>SponsorBlock</h2>
    <p>Uses the API from <a href="https://sponsor.ajay.app/">sponsor.ajay.app</a></p>
    <b>Enable Sponsorblock</b>
    <br />
    <input class="uk-checkbox" v-model="sponsorBlock" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Sponsors</b>
    <br />
    <input class="uk-checkbox" v-model="skipSponsor" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Intermission/Intro Animation</b>
    <br />
    <input class="uk-checkbox" v-model="skipIntro" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Endcards/Credits</b>
    <br />
    <input class="uk-checkbox" v-model="skipOutro" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Preview/Recap</b>
    <br />
    <input class="uk-checkbox" v-model="skipPreview" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Interaction Reminder (Subscribe)</b>
    <br />
    <input class="uk-checkbox" v-model="skipInteraction" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Unpaid/Self Promotion</b>
    <br />
    <input class="uk-checkbox" v-model="skipSelfPromo" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Skip Music: Non-Music Section</b>
    <br />
    <input class="uk-checkbox" v-model="skipMusicOffTopic" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Theme</b>
    <br />
    <select class="uk-select uk-width-auto" v-model="selectedTheme" @change="onChange($event)">
        <option value="auto">Auto</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
    </select>
    <br />
    <b>Autoplay Video</b>
    <br />
    <input class="uk-checkbox" v-model="autoPlayVideo" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Audio Only</b>
    <br />
    <input class="uk-checkbox" v-model="listen" @change="onChange($event)" type="checkbox" />
    <br />
    <b>Default Quality</b>
    <br />
    <select class="uk-select uk-width-auto" v-model="defaultQuality" @change="onChange($event)">
        <option value="0">Auto</option>
        <option :key="resolution" v-for="resolution in resolutions" :value="resolution">{{ resolution }}p</option>
    </select>
    <br />
    <b>Buffering Goal</b>
    <br />
    <input class="uk-input uk-width-auto" v-model="bufferingGoal" @change="onChange($event)" type="text" />
    <br />
    <b>Country Selection</b>
    <br />
    <select class="uk-select uk-width-auto" v-model="country" @change="onChange($event)">
        <option :key="country.code" v-for="country in countryMap" :value="country.code">{{ country.name }}</option>
    </select>
    <br />
    <b>Default Homepage</b>
    <br />
    <select class="uk-select uk-width-auto" v-model="defaultHomepage" @change="onChange($event)">
        <option value="trending">Trending</option>
        <option value="feed">Feed</option>
    </select>
    <br />
    <b>Show Comments</b>
    <br />
    <input class="uk-checkbox" v-model="showComments" @change="onChange($event)" type="checkbox" />
    <h2>Instances List</h2>
    <table class="uk-table">
        <thead>
            <tr>
                <th>Instance Name</th>
                <th>Instance Locations</th>
                <th>Has CDN?</th>
                <th>SSL Score</th>
            </tr>
        </thead>
        <tbody v-bind:key="instance.name" v-for="instance in instances">
            <tr>
                <td>{{ instance.name }}</td>
                <td>{{ instance.locations }}</td>
                <td>{{ instance.cdn }}</td>
                <td>
                    <a :href="sslScore(instance.apiurl)" target="_blank">Click Here</a>
                </td>
            </tr>
        </tbody>
    </table>

    <hr />

    <b>Instance Selection:</b>
    <br />
    <select class="uk-select uk-width-auto" v-model="selectedInstance" @change="onChange($event)">
        <option v-bind:key="instance.name" v-for="instance in instances" v-bind:value="instance.apiurl">
            {{ instance.name }}
        </option>
    </select>
</template>

<script>
import CountryMap from '@/utils/CountryMap.js'
export default {
  data () {
    return {
      selectedInstance: null,
      instances: [],
      sponsorBlock: true,
      skipSponsor: true,
      skipIntro: false,
      skipOutro: false,
      skipPreview: false,
      skipInteraction: true,
      skipSelfPromo: true,
      skipMusicOffTopic: true,
      selectedTheme: 'dark',
      autoPlayVideo: true,
      listen: false,
      resolutions: [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320],
      defaultQuality: 0,
      bufferingGoal: 10,
      countryMap: CountryMap.COUNTRIES,
      country: 'US',
      defaultHomepage: 'trending',
      showComments: true
    }
  },
  mounted () {
    if (Object.keys(this.$route.query).length > 0) this.$router.replace({ query: {} })

    fetch('https://raw.githubusercontent.com/wiki/TeamPiped/Piped-Frontend/Instances.md')
      .then(resp => resp.text())
      .then(body => {
        let skipped = 0
        const lines = body.split('\n')
        lines.forEach(line => {
          const split = line.split('|')
          if (split.length === 4) {
            if (skipped < 2) {
              skipped++
              return
            }
            this.instances.push({
              name: split[0].trim(),
              apiurl: split[1].trim(),
              locations: split[2].trim(),
              cdn: split[3].trim()
            })
          }
        })
      })

    if (localStorage) {
      this.selectedInstance = this.getPreferenceString('instance', 'https://pipedapi.kavin.rocks')

      this.sponsorBlock = this.getPreferenceBoolean('sponsorblock', true)
      if (localStorage.getItem('selectedSkip') !== null) {
        const skipList = localStorage.getItem('selectedSkip').split(',')
        this.skipSponsor = this.skipIntro = this.skipOutro = this.skipPreview = this.skipInteraction = this.skipSelfPromo = this.skipMusicOffTopic = false
        skipList.forEach(skip => {
          switch (skip) {
            case 'sponsor':
              this.skipSponsor = true
              break
            case 'intro':
              this.skipIntro = true
              break
            case 'outro':
              this.skipOutro = true
              break
            case 'preview':
              this.skipPreview = true
              break
            case 'interaction':
              this.skipInteraction = true
              break
            case 'selfpromo':
              this.skipSelfPromo = true
              break
            case 'music_offtopic':
              this.skipMusicOffTopic = true
              break
            default:
              console.log('Unknown sponsor type: ' + skip)
              break
          }
        })
      }

      this.selectedTheme = this.getPreferenceString('theme', 'dark')
      this.autoPlayVideo = this.getPreferenceBoolean(localStorage.getItem('playerAutoPlay'), true)
      this.listen = this.getPreferenceBoolean('listen', false)
      this.defaultQuality = Number(localStorage.getItem('quality'))
      this.bufferingGoal = Math.max(Number(localStorage.getItem('bufferGoal')), 10)
      this.country = this.getPreferenceString('region', 'US')
      this.defaultHomepage = this.getPreferenceString('homepage', 'trending')
      this.showComments = this.getPreferenceBoolean('comments', true)
    }
  },
  methods: {
    onChange () {
      if (localStorage) {
        let shouldReload = false

        if (this.getPreferenceString('theme', 'dark') !== this.selectedTheme) shouldReload = true

        localStorage.setItem('instance', this.selectedInstance)
        localStorage.setItem('sponsorblock', this.sponsorBlock)

        const sponsorSelected = []
        if (this.skipSponsor) sponsorSelected.push('sponsor')
        if (this.skipIntro) sponsorSelected.push('intro')
        if (this.skipOutro) sponsorSelected.push('outro')
        if (this.skipPreview) sponsorSelected.push('preview')
        if (this.skipInteraction) sponsorSelected.push('interaction')
        if (this.skipSelfPromo) sponsorSelected.push('selfpromo')
        if (this.skipMusicOffTopic) sponsorSelected.push('music_offtopic')
        localStorage.setItem('selectedSkip', sponsorSelected)

        localStorage.setItem('theme', this.selectedTheme)
        localStorage.setItem('playerAutoPlay', this.autoPlayVideo)
        localStorage.setItem('listen', this.listen)
        localStorage.setItem('quality', this.defaultQuality)
        localStorage.setItem('bufferGoal', this.bufferingGoal)
        localStorage.setItem('region', this.country)
        localStorage.setItem('homepage', this.defaultHomepage)
        localStorage.setItem('comments', this.showComments)

        if (shouldReload) window.location.reload()
      }
    },
    sslScore (url) {
      return 'https://www.ssllabs.com/ssltest/analyze.html?d=' + new URL(url).host + '&latest'
    }
  }
}
</script>
