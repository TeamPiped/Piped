<template>
    <div>Loading...</div>
</template>

<script>
export default {
  activated () {
    const videoId = this.$route.params.videoId
    if (videoId) {
      this.$router.push({
        path: '/watch',
        query: { v: videoId }
      })
    }
  }
}
</script>
