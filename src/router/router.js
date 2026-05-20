import { createRouter, createWebHistory } from "vue-router";
import { getHomePage } from "@/composables/useMisc.js";

const routes = [
    {
        path: "/",
        name: "Home",
        redirect: () => getHomePage() ?? "/recommended",
    },
    {
        path: "/recommended",
        name: "Recommended",
        component: () => import("../components/RecommendedPage.vue"),
    },
    {
        path: "/trending",
        name: "Trending",
        component: () => import("../components/TrendingPage.vue"),
    },
    {
        path: "/shorts",
        name: "Shorts",
        component: () => import("../components/ShortsPage.vue"),
    },
    {
        path: "/tiktok",
        name: "TikTok",
        component: () => import("../components/TikTokPage.vue"),
    },
    {
        path: "/queue",
        name: "WatchQueue",
        component: () => import("../components/WatchQueuePage.vue"),
    },
    {
        path: "/collections",
        name: "Collections",
        component: () => import("../components/CollectionsPage.vue"),
    },
    {
        path: "/watch-later",
        name: "WatchLater",
        component: () => import("../components/WatchLaterPage.vue"),
    },
    {
        path: "/favorites",
        name: "Favorites",
        component: () => import("../components/FavoritesPage.vue"),
    },
    {
        path: "/stats",
        name: "Stats",
        component: () => import("../components/StatsPage.vue"),
    },
    {
        path: "/bookmarks",
        name: "Bookmarks",
        component: () => import("../components/BookmarksPage.vue"),
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
        path: "/watch_videos",
        name: "WatchVideos",
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
        alias: ["/feed/subscriptions"],
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
