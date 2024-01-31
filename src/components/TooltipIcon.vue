<template>
    <div id="container" class="m-2 self-center">
        <div :class="icon" class="cursor-pointer"></div>
        <p id="tooltip" class="absolute mr-[20vw] mt-2 hidden rounded-l bg-gray-800 px-2 py-1 text-gray-200">
            {{ tooltip }}
        </p>
    </div>
</template>

<script>
export default {
    props: {
        icon: {
            type: String, // the class name of a font awesome icon
            required: true,
        },
        tooltip: {
            type: String,
            required: true,
        },
    },
};
</script>

<style>
#container:hover #tooltip {
    display: block;
}
</style>
