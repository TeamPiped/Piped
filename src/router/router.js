import { createRouter, createWebHistory } from 'vue-router'
import Watch from '../components/WatchVideo.vue'
import Trending from '../components/TrendingPage.vue'

const routes = [{
    path: '/watch',
    name: 'Watch',
    component: Watch
}, {
    path: '/',
    name: 'Trending',
    component: Trending
}]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router