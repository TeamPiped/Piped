<template>
    <button
        type="button"
        class="absolute right-3 size-4 cursor-pointer rounded-full bg-gray-300 text-center text-[10px] text-black opacity-50 hover:opacity-70 dark:bg-gray-400"
        :aria-label="$t('actions.clear')"
        @click="$emit('clear')"
    >
        ⨉
    </button>
</template>

<script setup>
import { useI18n } from "vue-i18n";

defineEmits(["clear"]);

const { t: $t } = useI18n();
</script>
