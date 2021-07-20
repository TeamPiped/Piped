import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Trending',
    component: () => import('@/components/TrendingPage')
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: () => import('@/components/Preferences')
  },
  {
    path: '/results',
    name: 'SearchResults',
    component: () => import('@/components/SearchResults')
  },
  {
    path: '/playlist',
    name: 'Playlist',
    component: () => import('@/components/Playlist')
  },
  {
    path: '/:path(v|w|embed|shorts|watch)/:v?',
    name: 'WatchVideo',
    component: () => import('@/components/WatchVideo')
  },
  {
    path: '/:path(channel|user|c)/:channelId/:videos?',
    name: 'Channel',
    component: () => import('@/components/Channel')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/components/LoginPage')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/components/RegisterPage')
  },
  {
    path: '/feed',
    name: 'Feed',
    component: () => import('@/components/FeedPage')
  },
  {
    path: '/import',
    name: 'Import',
    component: () => import('@/components/ImportPage')
  },
  {
    path: '/:videoId([a-zA-Z0-9_-]{11})',
    component: () => import('@/components/VideoRedirect')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: function (_to, _from, savedPosition) {
    return savedPosition || window.scrollTo(0, 0)
  }
})

export default router
