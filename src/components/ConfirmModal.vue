<template>
    <ModalComponent @close="$emit('close')">
        <div>
            <h3 class="text-xl" v-text="message" />
            <div class="ml-auto mt-8 flex gap-2 w-min">
                <button class="btn" v-t="'actions.cancel'" @click="$emit('close')" />
                <button class="btn" v-t="'actions.okay'" @click="$emit('confirm')" />
            </div>
        </div>
    </ModalComponent>
</template>

<script>
import ModalComponent from "./ModalComponent.vue";

export default {
    components: {
        ModalComponent,
    },
    props: {
        message: String,
    },
    emits: ["close", "confirm"],
};
</script>
