import js from "@eslint/js";
import unoConfig from "@unocss/eslint-config/flat";
import { defineConfig } from "eslint/config";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import vue from "eslint-plugin-vue";
import globals from "globals";

export default defineConfig([
    {
        ignores: ["**/.*", "node_modules/**", "dist/**", "dist-ci/**"],
    },
    {
        files: ["**/*.{js,mjs,cjs,vue}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        ...js.configs.recommended,
        files: ["**/*.{js,mjs,cjs,vue}"],
    },
    ...vue.configs["flat/recommended"],
    {
        ...unoConfig,
        files: ["**/*.{js,mjs,cjs,vue}"],
    },
    {
        files: ["**/*.vue"],
        rules: {
            "no-useless-assignment": "off",
        },
    },
    {
        ...prettierRecommended,
        files: ["**/*.{js,mjs,cjs,vue}"],
    },
]);
