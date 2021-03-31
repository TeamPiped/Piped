<template>
    <div
        class="uk-position-absolute uk-panel uk-box-shadow-large uk-padding-small suggestions-container"
    >
        <ul class="uk-list uk-margin-remove uk-text-secondary">
            <li v-for="(suggestion, i) in searchSuggestions" :key="i">
                {{ suggestion }}
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    props: {
        searchSuggestions: Array
    }
};
</script>

<style>
.suggestions-container {
    background-color: #242727;
    left: 50%;
    transform: translateX(-50%);
    max-width: 640px;
    width: 100%;
    box-sizing: border-box;
}
@media screen and (max-width: 959px) {
    .suggestions-container {
        max-width: calc(100% - 60px);
    }
}
@media screen and (max-width: 639px) {
    .suggestions-container {
        max-width: calc(100% - 30px);
    }
}
</style>
