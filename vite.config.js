import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import WindiCSS from "vite-plugin-windicss";
import vueI18n from "@intlify/vite-plugin-vue-i18n";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        WindiCSS(),
        vueI18n({
            include: path.resolve(__dirname, "./src/locales/**"),
        }),
        VitePWA({ registerType: "autoUpdate" }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
