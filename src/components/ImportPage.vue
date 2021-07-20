<template>
    <div class="uk-vertical-align uk-text-center uk-height-1-1 ">
        <form class="uk-panel uk-panel-box">
            <div class="uk-form-row">
                <input type="file" @change="fileChange" ref="fileSelector" />
            </div>
            <div class="uk-form-row">
                <b>Selected Subscriptions: {{ selectedSubscriptions }}</b>
            </div>
            <div class="uk-form-row">
                <a
                    class="uk-width-1-1 uk-button uk-button-primary uk-button-large uk-width-auto"
                    style="background: #222"
                    @click="handleImport"
                    >Import</a
                >
            </div>
        </form>
        <br />
        <b>Importing Subscriptions from YouTube</b>
        <br />
        <div>
            Open
            <a href="https://takeout.google.com/takeout/custom/youtube">takeout.google.com/takeout/custom/youtube</a>
            <br />
            In "Select data to include", click on "All YouTube data included" and select only "subscriptions".
            <br />
            Create the export and download the zip file.
            <br />
            Extract subscriptions.json from the zip file.
            <br />
            Select and import the file above.
        </div>
        <br />
        <b>Importing Subscriptions from Invidious</b>
        <br />
        <div>
            Open
            <a href="https://invidio.us/data_control">invidiou.us/data_control</a>
            <br />
            Click on any of the export options.
            <br />
            Select and import the file above.
        </div>
        <br />
        <b>Importing Subscriptions from NewPipe</b>
        <br />
        <div>
            Go to the Feed tab.
            <br />
            Click on the arrow on where it says "Subscriptions".
            <br />
            Save the file somewhere.
            <br />
            Select and import the file above.
        </div>
    </div>
</template>

<script>
export default {
  data () {
    return {
      subscriptions: []
    }
  },
  computed: {
    selectedSubscriptions () {
      return this.subscriptions.length
    }
  },
  activated () {
    if (!this.authenticated) this.$router.push('/login')
  },
  methods: {
    fileChange () {
      this.$refs.fileSelector.files[0].text().then(text => {
        this.subscriptions = []

        // Invidious
        if (text.indexOf('opml') !== -1) {
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(text, 'text/xml')
          xmlDoc.querySelectorAll('outline[xmlUrl]').forEach(item => {
            const url = item.getAttribute('xmlUrl')
            const id = url.substr(-24)
            this.subscriptions.push(id)
          })
        }
        // NewPipe
        if (text.indexOf('app_version') !== -1) {
          const json = JSON.parse(text)
          json.subscriptions
            .filter(item => item.service_id === 0)
            .forEach(item => {
              const url = item.url
              const id = url.substr(-24)
              this.subscriptions.push(id)
            })
        }
        // Invidious JSON
        if (text.indexOf('thin_mode') !== -1) {
          const json = JSON.parse(text)
          this.subscriptions = json.subscriptions
        }
        // Google Takeout
        if (text.indexOf('contentDetails') !== -1) {
          const json = JSON.parse(text)
          json.forEach(item => {
            const id = item.snippet.resourceId.channelId
            this.subscriptions.push(id)
          })
        }
      })
    },
    handleImport () {
      this.fetchJson(this.apiUrl() + '/import', null, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthToken()
        },
        body: JSON.stringify(this.subscriptions)
      }).then(json => {
        if (json.message === 'ok') window.location = '/feed'
      })
    }
  }
}
</script>
