import { createRouter, createWebHistory } from "vue-router";

const routes = [
    {
        path: "/",
        name: "Trending",
        component: () => import("../components/TrendingPage.vue"),
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
    {
        path: "/:path(v|w|embed|shorts|watch)/:v?",
        component: () => import("../components/WatchVideo.vue"),
    },
    {
        path: "/:path(channel|user|c)/:channelId/:videos?",
        component: () => import("../components/Channel.vue"),
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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: function(_to, _from, savedPosition) {
        return savedPosition ? savedPosition : window.scrollTo(0, 0);
    },
});

export default router;
