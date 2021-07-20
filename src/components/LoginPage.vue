<template>
    <div class="uk-vertical-align uk-text-center uk-height-1-1 ">
        <form class="uk-panel uk-panel-box">
            <div class="uk-form-row">
                <input
                    class="uk-width-1-1 uk-form-large uk-input uk-width-auto"
                    type="text"
                    v-model="username"
                    autocomplete="username"
                    placeholder="Username"
                />
            </div>
            <div class="uk-form-row">
                <input
                    class="uk-width-1-1 uk-form-large uk-input  uk-width-auto"
                    type="password"
                    v-model="password"
                    autocomplete="password"
                    placeholder="Password"
                />
            </div>
            <div class="uk-form-row">
                <a
                    class="uk-width-1-1 uk-button uk-button-primary uk-button-large uk-width-auto"
                    style="background: #222"
                    @click="login"
                    >Login</a
                >
            </div>
        </form>
    </div>
</template>

<script>
export default {
  data () {
    return {
      username: null,
      password: null
    }
  },
  mounted () {
    // TODO: Add Server Side check
    if (this.getAuthToken()) {
      this.$router.push('/')
    }
  },
  methods: {
    login () {
      console.log('authToken' + this.hashCode(this.apiUrl()))
      this.fetchJson(this.apiUrl() + '/login', null, {
        method: 'POST',
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      }).then(resp => {
        if (resp.token) {
          this.setPreference('authToken' + this.hashCode(this.apiUrl()), resp.token)
          window.location = '/' // done to bypass cache
        } else alert(resp.error)
      })
    }
  }
}
</script>
