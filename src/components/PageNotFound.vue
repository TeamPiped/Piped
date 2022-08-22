<template>
    <div class="flex flex-col justify-center items-center min-h-[88vh]">
        <h1 class="font-bold">404</h1>
        <h2 v-t="'info.page_not_found'" />
        <a class="btn mt-16" href="/" v-t="'actions.back_to_home'" />
    </div>
</template>

<style scoped>
/* font size can't be handled within windiCSS classes because it's overwritten with !important */
h1 {
    font-size: 8rem !important;
}
h2 {
    font-size: 1.7rem !important;
}
</style>
