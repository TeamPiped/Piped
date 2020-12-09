import { createRouter, createWebHistory } from 'vue-router'
import Watch from '../components/WatchVideo.vue'
import Trending from '../components/TrendingPage.vue'
import Channel from '../components/Channel.vue'
import Preferences from '../components/Preferences.vue'
import SearchResults from '../components/SearchResults.vue'

const routes = [{
    path: '/watch',
    name: 'Watch',
    component: Watch
}, {
    path: '/',
    name: 'Trending',
    component: Trending
}, {
    path: '/channel/:channelId',
    name: 'Channel',
    component: Channel
}, {
    path: '/preferences',
    name: 'Preferences',
    component: Preferences
}, {
    path: '/results',
    name: 'SearchResults',
    component: SearchResults
}]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
