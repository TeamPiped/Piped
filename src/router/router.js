import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/watch",
        name: "Watch",
        component: () => import("../components/WatchVideo.vue"),
    },
    {
        path: "/",
        name: "Trending",
        component: () => import("../components/TrendingPage.vue"),
    },
    {
        path: "/channel/:channelId",
        name: "Channel",
        component: () => import("../components/Channel.vue"),
    },
    {
        path: "/preferences",
        name: "Preferences",
        component: () => import("../components/Preferences.vue"),
    },
    {
        path: "/results",
        name: "SearchResults",
        component: () => import("../components/SearchResults.vue"),
    },
    {
        path: "/playlist",
        name: "Playlist",
        component: () => import("../components/Playlist.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
