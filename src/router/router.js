import { createRouter, createWebHistory } from 'vue-router'
import Watch from '../components/WatchVideo.vue'
import Trending from '../components/TrendingPage.vue'
import Channel from '../components/Channel.vue'
import Preferences from '../components/Preferences.vue'

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
}]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
