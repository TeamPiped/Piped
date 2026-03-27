<script setup>
const homeUrl = import.meta.env.BASE_URL;
</script>

<template>
    <div class="flex min-h-[88vh] flex-col items-center justify-center">
        <h1 class="text-9xl! font-bold">404</h1>
        <h2 v-t="'info.page_not_found'" class="text-2xl!" />
        <a
            v-t="'actions.back_to_home'"
            class="mt-16 inline-block w-auto cursor-pointer rounded-sm bg-gray-300 py-2 text-gray-600 hover:bg-gray-500 hover:text-white focus:shadow-red-400 focus:outline-2 focus:outline-red-500 max-md:px-2 md:px-4 dark:bg-dark-400 dark:text-gray-400 dark:hover:bg-dark-300"
            :href="homeUrl"
        />
    </div>
</template>
