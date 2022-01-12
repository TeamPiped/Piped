import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import WindiCSS from "vite-plugin-windicss";
import vueI18n from "@intlify/vite-plugin-vue-i18n";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        WindiCSS(),
        vueI18n({
            include: path.resolve(__dirname, "./src/locales/**"),
        }),
        VitePWA({
            registerType: "autoUpdate",
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,svg,png}", "manifest.webmanifest"],
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
        },
    },
    build: {
        sourcemap: true,
    },
});
