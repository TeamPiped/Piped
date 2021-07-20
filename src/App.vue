<template>
  <v-app>
    <Navigation />
    <v-main>
      <router-view v-slot="{ Component }">
        <keep-alive :max="5">
          <component :key="$route.fullPath" :is="Component" />
        </keep-alive>
      </router-view>
    </v-main>
  </v-app>
</template>

<script>
import Navigation from '@/components/Navigation'
export default {
  components: {
    Navigation
  },
  mounted () {
    if (window.location.pathname === '/' || window.location.pathname.length === 0) {
      switch (this.getPreferenceString('homepage', 'trending')) {
        case 'trending':
          break
        case 'feed':
          this.$router.replace('/feed')
          break
        default:
          break
      }
    }
  }
}
</script>

<style>
h1,
p,
a,
b {
  unicode-bidi: plaintext;
  text-align: start;
}

::-webkit-scrollbar {
  background-color: #15191a;
  color: #c5bcae;
}

::-webkit-scrollbar-thumb {
  background-color: #4b4f52;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #5b6469;
}

::-webkit-scrollbar-thumb:active {
  background-color: #485053;
}

::-webkit-scrollbar-corner {
  background-color: #0b0e0f;
}

* {
  scrollbar-color: #15191a #444a4e;
}
</style>
