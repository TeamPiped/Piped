<template>
    <div v-if="!showContent" class="flex min-h-[75vh] w-full justify-center items-center">
        <span id="spinner" />
    </div>
    <div v-else>
        <slot />
    </div>
</template>

<style>
#spinner:after {
    --spinner-color: #000;
}

.dark #spinner:after {
    --spinner-color: #fff;
}

#spinner {
    display: inline-block;
    width: 70px;
    height: 70px;
}
#spinner:after {
    content: " ";
    display: block;
    width: 54px;
    height: 54px;
    margin: 8px;
    border-radius: 50%;
    border: 4px solid var(--spinner-color);
    border-color: var(--spinner-color) transparent var(--spinner-color) transparent;
    animation: spinner 1.2s linear infinite;
}

@keyframes spinner {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
</style>

<script>
export default {
    props: {
        showContent: {
            type: Boolean,
            required: true,
        },
    },
};
</script>
