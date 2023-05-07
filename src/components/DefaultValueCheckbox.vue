// Wrapper around v-model to allow default values without requiring to use a v-model inside the calling component

<script>
export default {
    props: {
        defaultValue: Boolean,
        callback: Function,
    },
    data() {
        return {
            value: false,
        };
    },
    mounted() {
        this.value = this.defaultValue;
    },
};
</script>

<template>
    <input type="checkbox" class="checkbox" v-model="value" @change="callback()" />
</template>
