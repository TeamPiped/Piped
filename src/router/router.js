import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../components/TrendingPage.vue"),
    },
    {
        path: "/trending",
        name: "Trending",
        component: () => import("../components/TrendingPage.vue"),
    },
    {
        path: "/preferences",
        name: "Preferences",
        component: () => import("../components/PreferencesPage.vue"),
    },
    {
        path: "/results",
        name: "SearchResults",
        component: () => import("../components/SearchResults.vue"),
    },
    {
        path: "/playlist",
        name: "Playlist",
        component: () => import("../components/PlaylistPage.vue"),
    },
    {
        path: "/:path(v|w|embed|live|shorts|watch)/:v?",
        name: "WatchVideo",
        component: () => import("../components/WatchVideo.vue"),
    },
    {
        path: "/clip/:clipId",
        name: "Clips",
        component: () => import("../components/ClipsPage.vue"),
    },
    {
        path: "/:path(channel|user|c)/:channelId/:videos?",
        name: "Channel",
        component: () => import("../components/ChannelPage.vue"),
    },
    {
        path: "/@:channelId",
        name: "Channel handle",
        component: () => import("../components/ChannelPage.vue"),
    },
    {
        path: "/login",
        name: "Login",
        component: () => import("../components/LoginPage.vue"),
    },
    {
        path: "/register",
        name: "Register",
        component: () => import("../components/RegisterPage.vue"),
    },
    {
        path: "/feed",
        name: "Feed",
        component: () => import("../components/FeedPage.vue"),
    },
    {
        path: "/import",
        name: "Import",
        component: () => import("../components/ImportPage.vue"),
    },
    {
        path: "/:videoId([a-zA-Z0-9_-]{11})",
        component: () => import("../components/VideoRedirect.vue"),
    },
    {
        path: "/subscriptions",
        name: "Subscriptions",
        component: () => import("../components/SubscriptionsPage.vue"),
    },
    {
        path: "/history",
        name: "Watch History",
        component: () => import("../components/HistoryPage.vue"),
    },
    {
        path: "/playlists",
        name: "Playlists",
        component: () => import("../components/PlaylistsPage.vue"),
    },
    {
        path: "/:pathMatch(.*)*",
        name: "Page Not Found",
        component: () => import("../components/PageNotFound.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: function (_to, _from, savedPosition) {
        return savedPosition ? savedPosition : window.scrollTo(0, 0);
    },
});

export default router;
