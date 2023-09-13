<template>
    <ModalComponent @close="$emit('close')">
        <div>
            <h5 v-text="message" />
            <hr />
            <div class="w-min flex" style="gap: var(--efy_gap0)">
                <button v-t="'actions.cancel'" class="btn" @click="$emit('close')" />
                <button v-t="'actions.okay'" class="btn" @click="$emit('confirm')" />
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
        message: {
            type: String,
            required: true,
        },
    },
    emits: ["close", "confirm"],
};
</script>
