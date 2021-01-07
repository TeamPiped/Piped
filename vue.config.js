module.exports = {
    pwa: {
        name: 'Piped',
        themeColor: '#fa4b4b',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black',
        workboxPluginMode: 'GenerateSW',
        workboxOptions: {
            navigateFallback: 'index.html',
            skipWaiting: true
        }
    }
}
