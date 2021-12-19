module.exports = {
    pwa: {
        name: "Piped",
        themeColor: "#fa4b4b",
        msTileColor: "#000000",
        appleMobileWebAppCapable: "yes",
        appleMobileWebAppStatusBarStyle: "black",
        workboxPluginMode: "GenerateSW",
        workboxOptions: {
            navigateFallback: "index.html",
            skipWaiting: true,
            importWorkboxFrom: "local",
            runtimeCaching: [
                {
                    urlPattern: /\.(?:png|svg|ico)$/,
                    handler: "CacheFirst",
                },
            ],
        },
    },
    configureWebpack: {
        resolve: {
            alias: {
                "vue-i18n": "vue-i18n/dist/vue-i18n.runtime.esm-bundler.js",
            },
        },
    },
    pluginOptions: {
        i18n: {
            locale: "en",
            fallbackLocale: "en",
            localeDir: "locales",
            fullInstall: true,
            enableLegacy: false,
        },
    },
};
