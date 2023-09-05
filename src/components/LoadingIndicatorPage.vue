<template>
    <div v-if="!showContent" class="min-h-[75vh] w-full flex items-center justify-center">
        <span id="spinner" />
    </div>
    <div v-else>
        <slot />
    </div>
</template>

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

<style>
#spinner {
    display: inline-block;
    width: 70rem;
    height: 70rem;
}
#spinner:after {
    content: " ";
    display: block;
    width: 54rem;
    height: 54rem;
    margin: 8rem;
    border-radius: 50%;
    border: 4rem solid var(--efy_text);
    border-color: var(--efy_text) transparent var(--efy_text) transparent;
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
