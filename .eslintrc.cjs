module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: ["plugin:vue/vue3-recommended", "eslint:recommended", "@unocss", "plugin:prettier/recommended"],
    rules: {
        "vue/no-undef-components": ["error", {
            ignorePatterns: ["router-link", "router-view", "i18n-t", "ErrorHandler"]
        }],
    },
};
