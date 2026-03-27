import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import vue from "eslint-plugin-vue";
import globals from "globals";
import vueParser from "vue-eslint-parser";

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
        files: ["**/*.vue"],
        rules: {
            "no-useless-assignment": "off",
        },
    },
    {
        files: ["**/*.vue"],
        extends: [betterTailwindcss.configs.recommended],
        settings: {
            "better-tailwindcss": {
                entryPoint: "src/app.css",
            },
        },
        languageOptions: {
            parser: vueParser,
        },
        rules: {
            "better-tailwindcss/enforce-consistent-line-wrapping": "off",
        },
    },
    {
        ...prettierRecommended,
        files: ["**/*.{js,mjs,cjs,vue}"],
    },
]);
