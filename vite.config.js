import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import Unocss from "unocss/vite";
import legacy from "@vitejs/plugin-legacy";
import vueI18n from "@intlify/vite-plugin-vue-i18n";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        Unocss(),
        vueI18n({
            include: path.resolve(__dirname, "./src/locales/**"),
        }),
        legacy({
            targets: ["defaults", "not IE 11"],
        }),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,svg,png}", "manifest.webmanifest"],
                globIgnores: ["**/*-legacy-*.js"],
                runtimeCaching: [
                    {
                        urlPattern: /https:\/\/[a-zA-Z./0-9_]*\.(?:otf|ttf)/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
            manifest: {
                name: "Piped",
                short_name: "Piped",
                background_color: "#000000",
                theme_color: "#fa4b4b",
                icons: [
                    { src: "./img/icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
                    { src: "./img/icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
                    {
                        src: "./img/icons/android-chrome-maskable-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "maskable",
                    },
                    {
                        src: "./img/icons/android-chrome-maskable-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
        }),
        eslintPlugin(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            stream: "stream-browserify",
        },
    },
    build: {
        sourcemap: true,
    },
});
